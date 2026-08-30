import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Brain, Cpu } from 'lucide-react';

const AINode = ({ data, selected }) => {
  return (
    <div
      className={`relative min-w-[230px] rounded-xl p-4 transition-all duration-200 border ${
        selected
          ? 'bg-slate-900/95 border-purple-500 shadow-glow-primary'
          : 'bg-slate-900/80 border-purple-500/40 hover:border-purple-500/70'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">AI Agent Node</span>
          <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{data.label || 'AI Transform'}</h4>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-purple-200 bg-purple-950/30 p-2 rounded-lg border border-purple-500/20">
        <div className="flex items-center justify-between font-mono text-[10px] text-purple-400 mb-1">
          <span>{data.model || 'gpt-4o-mini'}</span>
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Agentic</span>
        </div>
        <p className="line-clamp-2 text-slate-300 text-[11px]">
          {data.systemPrompt || 'Intelligent reasoning & entity transformation'}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-slate-900"
      />
    </div>
  );
};

export default memo(AINode);
