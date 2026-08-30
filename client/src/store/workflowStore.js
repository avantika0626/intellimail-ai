import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

export const useWorkflowStore = create((set, get) => ({
  workflowId: null,
  workflowName: 'Untitled Automation Workflow',
  workflowDescription: 'Automated AI agent pipeline',
  status: 'active',
  tags: ['automation', 'ai'],
  version: 1,
  
  nodes: [],
  edges: [],
  selectedNode: null,

  isGenerating: false,
  isSaving: false,
  isExecuting: false,
  activeExecution: null,

  // React Flow state handlers
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } }, get().edges),
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => {
    const existing = get().nodes;
    set({
      nodes: [...existing, node],
      selectedNode: node,
    });
  },

  updateNodeData: (nodeId, dataUpdate) => {
    const updatedNodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        const mergedData = { ...node.data, ...dataUpdate };
        const updated = { ...node, data: mergedData };
        if (get().selectedNode?.id === nodeId) {
          set({ selectedNode: updated });
        }
        return updated;
      }
      return node;
    });

    set({ nodes: updatedNodes });
  },

  deleteNode: (nodeId) => {
    const nodes = get().nodes.filter((n) => n.id !== nodeId);
    const edges = get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    set({
      nodes,
      edges,
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
    });
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  setWorkflowMeta: ({ name, description, tags, status }) => {
    set((state) => ({
      workflowName: name !== undefined ? name : state.workflowName,
      workflowDescription: description !== undefined ? description : state.workflowDescription,
      tags: tags !== undefined ? tags : state.tags,
      status: status !== undefined ? status : state.status,
    }));
  },

  setFullWorkflow: (workflow) => {
    set({
      workflowId: workflow._id || workflow.id,
      workflowName: workflow.name || 'Untitled Workflow',
      workflowDescription: workflow.description || '',
      tags: workflow.tags || ['automation'],
      status: workflow.status || 'active',
      version: workflow.version || 1,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      selectedNode: null,
    });
  },

  resetWorkflow: () => {
    set({
      workflowId: null,
      workflowName: 'Untitled Automation Workflow',
      workflowDescription: 'Automated AI agent pipeline',
      status: 'active',
      tags: ['automation'],
      version: 1,
      nodes: [],
      edges: [],
      selectedNode: null,
      isGenerating: false,
      isSaving: false,
      isExecuting: false,
      activeExecution: null,
    });
  },
}));
