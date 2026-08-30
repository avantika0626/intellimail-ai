import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Check, X } from 'lucide-react';

const ConditionNode = ({ data, selected }) => {
  return (
    <div
      className={`relative min-w-[220px] rounded-xl p-4 transition-all duration-200 border ${
        selected
          ? 'bg-slate-900/95 border-amber-500 shadow-glow-amber'
          : 'bg-slate-900/80 border-amber-500/40 hover:border-amber-500/70'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-slate-800/80 border border-amber-500/30">
          <GitBranch className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Condition Rule</span>
          <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{data.label || 'Decision Branch'}</h4>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-slate-300 bg-slate-950/40 p-1.5 rounded border border-slate-800 font-mono flex items-center justify-between">
        <span className="text-amber-400">{data.field || 'field'}</span>
        <span>{data.operator || '>'}</span>
        <span className="text-cyan-400">{String(data.threshold ?? 1000)}</span>
      </div>

      {/* Outgoing True / False handles */}
      <Handle
        id="true"
        type="source"
        position={Position.Right}
        style={{ top: '35%' }}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-slate-900"
      />
      <Handle
        id="false"
        type="source"
        position={Position.Right}
        style={{ top: '65%' }}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-slate-900"
      />
    </div>
  );
};

export default memo(ConditionNode);
