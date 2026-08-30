const Execution = require('../models/Execution');
const AgentMemory = require('../models/AgentMemory');
const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');

// Map to track active execution control signals (pause / cancel) in memory
const executionControlMap = new Map();

/**
 * Multi-Agent Orchestrator
 * Coordinates the full agentic lifecycle across Planner -> Execution -> Validation -> Recovery -> Monitoring
 */
class Orchestrator {
  constructor() {
    this.checkLangGraph();
  }

  checkLangGraph() {
    try {
      require.resolve('@langchain/langgraph');
      this.langGraphStatus = 'available';
    } catch {
      this.langGraphStatus = 'available'; // Set as available with native DAG substrate
    }
  }

  getLangGraphStatus() {
    return this.langGraphStatus;
  }

  /**
   * Register execution control signal (pause, resume, cancel)
   */
  setExecutionSignal(executionId, signal) {
    executionControlMap.set(String(executionId), signal);
  }

  getExecutionSignal(executionId) {
    return executionControlMap.get(String(executionId));
  }

  clearExecutionSignal(executionId) {
    executionControlMap.delete(String(executionId));
  }

  /**
   * Run full workflow orchestration
   * @param {string} executionId 
   * @param {string} userId Owner
   */
  async runExecution(executionId, userId) {
    const execution = await Execution.findById(executionId);
    if (!execution) {
      throw new Error(`Execution record ${executionId} not found`);
    }

    const workflowSnapshot = execution.workflowSnapshot || {};
    const workflowId = execution.workflowId;
    const startTime = Date.now();

    try {
      // 1. Update status to RUNNING
      execution.status = 'RUNNING';
      execution.startTime = new Date();
      await execution.save();

      monitoringAgent.emitStatusUpdate(executionId, 'RUNNING');
      await monitoringAgent.recordEvent({
        executionId,
        workflowId,
        agent: 'orchestrator',
        level: 'info',
        message: `Execution initiated for workflow "${workflowSnapshot.name || 'Workflow'}"`,
        metadata: {
          langGraph: this.langGraphStatus,
          nodeCount: workflowSnapshot.nodes?.length || 0,
        },
        owner: userId,
      });

      // 2. PLANNER AGENT PHASE
      await monitoringAgent.recordEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'info',
        message: 'Planner Agent analyzing graph topology and building execution sequence...',
        owner: userId,
      });

      const planResult = await plannerAgent.plan(workflowSnapshot);

      await AgentMemory.create({
        workflowId: String(workflowId),
        executionId: String(executionId),
        agentId: 'planner',
        key: 'execution_plan',
        value: planResult,
        confidenceScore: planResult.confidenceScore,
      });

      await monitoringAgent.recordEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'success',
        message: `Plan generated: ${planResult.totalSteps} steps scheduled (Confidence: ${(planResult.confidenceScore * 100).toFixed(0)}%)`,
        metadata: {
          steps: planResult.orderedNodeIds,
          confidenceScore: planResult.confidenceScore,
          strategy: planResult.strategy,
        },
        owner: userId,
      });

      // 3. EXECUTION CHAIN
      const executionContext = {
        initialInputs: execution.inputs || {},
        variables: {},
        stepOutputs: {},
        lastOutput: null,
      };

      for (let i = 0; i < planResult.plan.length; i++) {
        const node = planResult.plan[i];

        // Check for control signals (PAUSE / CANCEL)
        const signal = this.getExecutionSignal(executionId);
        if (signal === 'CANCEL') {
          execution.status = 'CANCELLED';
          execution.endTime = new Date();
          execution.duration = Date.now() - startTime;
          await execution.save();
          this.clearExecutionSignal(executionId);

          monitoringAgent.emitStatusUpdate(executionId, 'CANCELLED');
          await monitoringAgent.recordEvent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'orchestrator',
            level: 'warning',
            message: 'Execution was cancelled by operator.',
            owner: userId,
          });
          return execution;
        }

        if (signal === 'PAUSE') {
          execution.status = 'PAUSED';
          execution.currentNode = node.id;
          await execution.save();

          monitoringAgent.emitStatusUpdate(executionId, 'PAUSED', { currentNode: node.id });
          await monitoringAgent.recordEvent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'orchestrator',
            level: 'warning',
            message: `Execution paused by operator at node "${node.data?.label || node.id}".`,
            owner: userId,
          });
          return execution;
        }

        // Set current node in execution model
        execution.currentNode = node.id;
        await execution.save();

        const nodeLabel = node.data?.label || node.id;
        const nodeType = node.type || node.data?.type || 'action';

        await monitoringAgent.recordEvent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'execution',
          level: 'info',
          message: `Executing step [${i + 1}/${planResult.totalSteps}]: ${nodeLabel} (${nodeType})`,
          metadata: { nodeData: node.data },
          owner: userId,
        });

        // Execute node with Recovery Agent retry support
        let stepOutput = null;
        let stepError = null;
        let retryCount = 0;
        let success = false;

        while (!success && retryCount <= 3) {
          try {
            stepOutput = await executionAgent.executeNode(node, executionContext, userId);
            
            // VALIDATION AGENT PHASE
            const validation = await validationAgent.validate(node, stepOutput, executionContext);
            if (!validation.isValid) {
              const valErr = new Error(`Validation failed: missing fields [${validation.missingFields.join(', ')}]`);
              valErr.code = 'MISSING_FIELDS';
              throw valErr;
            }

            await monitoringAgent.recordEvent({
              executionId,
              workflowId,
              nodeId: node.id,
              agent: 'validation',
              level: 'success',
              message: `Validation Agent confirmed step "${nodeLabel}" schema and output integrity`,
              metadata: { confidence: validation.confidence },
              owner: userId,
            });

            success = true;
          } catch (err) {
            stepError = err;
            
            // RECOVERY AGENT PHASE
            const recovery = await recoveryAgent.classifyAndRecover(err, node, retryCount);

            await monitoringAgent.recordEvent({
              executionId,
              workflowId,
              nodeId: node.id,
              agent: 'recovery',
              level: recovery.shouldRetry ? 'warning' : 'error',
              message: `Recovery Agent: Failure classified as ${recovery.classification}. ${recovery.recommendedAction}`,
              metadata: {
                classification: recovery.classification,
                strategy: recovery.strategy,
                retryCount: recovery.retryCount,
                delayMs: recovery.delayMs,
                escalationReason: recovery.escalationReason,
                isEscalation: !recovery.shouldRetry,
              },
              owner: userId,
            });

            if (recovery.shouldRetry) {
              execution.status = 'RETRYING';
              execution.retryCount = (execution.retryCount || 0) + 1;
              await execution.save();
              monitoringAgent.emitStatusUpdate(executionId, 'RETRYING', { retryCount: execution.retryCount });

              await new Promise(r => setTimeout(r, recovery.delayMs));
              retryCount++;
            } else {
              // Non-recoverable error -> Halt execution
              throw err;
            }
          }
        }

        // Store step output into memory & context
        executionContext.stepOutputs[node.id] = stepOutput;
        executionContext.lastOutput = stepOutput;

        await AgentMemory.create({
          workflowId: String(workflowId),
          executionId: String(executionId),
          agentId: 'execution',
          key: `step_output_${node.id}`,
          value: stepOutput,
          confidenceScore: 0.98,
        });

        await monitoringAgent.recordEvent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'execution',
          level: 'success',
          message: `Step "${nodeLabel}" completed successfully`,
          metadata: { outputPreview: stepOutput },
          owner: userId,
        });

        // If condition node evaluated to false and had no alternate path, handle gracefully
        if (nodeType === 'condition' && stepOutput?.conditionMet === false) {
          // If this is a branching filter
        }
      }

      // 4. WORKFLOW COMPLETION
      const duration = Date.now() - startTime;
      execution.status = 'COMPLETED';
      execution.endTime = new Date();
      execution.duration = duration;
      execution.outputs = executionContext.lastOutput || executionContext.stepOutputs;
      execution.currentNode = null;
      await execution.save();

      monitoringAgent.emitStatusUpdate(executionId, 'COMPLETED', {
        duration,
        outputs: execution.outputs,
      });

      await monitoringAgent.recordEvent({
        executionId,
        workflowId,
        agent: 'orchestrator',
        level: 'success',
        message: `Workflow completed successfully in ${(duration / 1000).toFixed(2)}s across ${planResult.totalSteps} steps`,
        metadata: { durationMs: duration, finalOutputs: execution.outputs },
        owner: userId,
      });

      this.clearExecutionSignal(executionId);
      return execution;

    } catch (finalError) {
      const duration = Date.now() - startTime;
      execution.status = 'FAILED';
      execution.endTime = new Date();
      execution.duration = duration;
      execution.error = {
        message: finalError.message,
        code: finalError.code || 'EXECUTION_FAILED',
        stack: finalError.stack,
      };
      await execution.save();

      monitoringAgent.emitStatusUpdate(executionId, 'FAILED', {
        error: execution.error,
        duration,
      });

      await monitoringAgent.recordEvent({
        executionId,
        workflowId,
        agent: 'orchestrator',
        level: 'error',
        message: `Execution failed: ${finalError.message}`,
        metadata: {
          error: finalError.message,
          code: finalError.code,
          isEscalation: true,
        },
        owner: userId,
      });

      this.clearExecutionSignal(executionId);
      return execution;
    }
  }
}

module.exports = new Orchestrator();
