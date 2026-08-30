/**
 * Planner Agent
 * Decides node ordering, analyzes DAG topology, and emits confidence score.
 */
class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  /**
   * Plan execution graph ordering
   * @param {Object} workflowSnapshot 
   * @returns {Object} { plan: Array<node>, confidenceScore: number, branches: Array }
   */
  async plan(workflowSnapshot) {
    const { nodes = [], edges = [] } = workflowSnapshot;

    if (!nodes || nodes.length === 0) {
      return {
        plan: [],
        confidenceScore: 0.0,
        error: 'Workflow contains no nodes to execute',
      };
    }

    // Map incoming and outgoing connections
    const adjacency = new Map();
    const inDegree = new Map();

    nodes.forEach(node => {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      if (adjacency.has(edge.source) && inDegree.has(edge.target)) {
        adjacency.get(edge.source).push(edge.target);
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      }
    });

    // Topological Sort (Kahn's Algorithm)
    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    const orderedIds = [];
    while (queue.length > 0) {
      const currentId = queue.shift();
      orderedIds.push(currentId);

      const neighbors = adjacency.get(currentId) || [];
      neighbors.forEach(neighborId => {
        inDegree.set(neighborId, inDegree.get(neighborId) - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      });
    }

    // Check if graph has cycles or disconnected nodes
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const plannedNodes = orderedIds.map(id => nodeMap.get(id)).filter(Boolean);

    // If topological sort missed nodes due to cycles, append remaining
    if (plannedNodes.length < nodes.length) {
      nodes.forEach(node => {
        if (!orderedIds.includes(node.id)) {
          plannedNodes.push(node);
        }
      });
    }

    // Compute confidence score based on connectivity and completeness
    let confidenceScore = 0.95;
    if (edges.length === 0 && nodes.length > 1) {
      confidenceScore = 0.70; // Disconnected nodes
    } else if (plannedNodes.length !== nodes.length) {
      confidenceScore = 0.80; // Potential cycle detected
    }

    return {
      plan: plannedNodes,
      orderedNodeIds: plannedNodes.map(n => n.id),
      totalSteps: plannedNodes.length,
      confidenceScore,
      strategy: 'topological_dag_traversal',
    };
  }
}

module.exports = new PlannerAgent();
