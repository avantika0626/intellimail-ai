import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TriggerNode from './TriggerNode';
import ActionNode from './ActionNode';
import ConditionNode from './ConditionNode';
import AINode from './AINode';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowCanvas({ readOnly = false, onDropNewNode }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    addNode,
  } = useWorkflowStore();

  const nodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      action: ActionNode,
      condition: ConditionNode,
      'ai-transform': AINode,
      ai: AINode,
    }),
    []
  );

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeTypeData = event.dataTransfer.getData('application/agentflow-node');
      if (!nodeTypeData) return;

      try {
        const parsed = JSON.parse(nodeTypeData);
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const position = {
          x: event.clientX - reactFlowBounds.left - 100,
          y: event.clientY - reactFlowBounds.top - 40,
        };

        const newNode = {
          id: `node-${Date.now()}`,
          type: parsed.type,
          position,
          data: {
            label: parsed.label,
            ...parsed.defaultData,
          },
        };

        addNode(newNode);
        if (onDropNewNode) onDropNewNode(newNode);
      } catch (err) {
        console.error('Error adding dropped node:', err);
      }
    },
    [addNode, onDropNewNode]
  );

  return (
    <div className="w-full h-full relative bg-background" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
      >
        <Background color="#1e293b" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <Controls position="bottom-left" showInteractive={!readOnly} />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            if (node.type === 'trigger') return '#10b981';
            if (node.type === 'condition') return '#f59e0b';
            if (node.type === 'ai-transform' || node.type === 'ai') return '#a855f7';
            return '#6366f1';
          }}
          maskColor="rgba(9, 13, 22, 0.75)"
          className="hidden md:block"
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-6 bg-background/50">
          <div className="p-4 rounded-2xl bg-surface/80 border border-slate-800 backdrop-blur max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Visual Workflow Canvas</h3>
            <p className="text-sm text-slate-400 mb-4">
              Drag nodes from the left palette or use the AI Prompt Generator to automatically materialize executable agent workflows.
            </p>
            <span className="text-xs px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/30">
              Drag & Drop Enabled
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
