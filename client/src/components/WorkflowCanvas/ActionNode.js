import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, MessageSquare, Send, Table, Globe, ArrowRight } from 'lucide-react';

const ActionNode = ({ data, selected }) => {
  const provider = data.provider || 'generic';

  const getProviderIcon = () => {
    switch (provider) {
      case 'gmail':
        return <Mail className="w-4 h-4 text-rose-400" />;
      case 'slack':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'discord':
        return <Send className="w-4 h-4 text-indigo-400" />;
      case 'google-sheets':
        return <Table className="w-4 h-4 text-cyan-400" />;
      default:
        return <Globe className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBorderColor = () => {
    if (selected) return 'border-primary-500 shadow-glow-primary bg-slate-900/95';
    switch (provider) {
      case 'gmail':
        return 'border-rose-500/40 bg-slate-900/80 hover:border-rose-500/70';
      case 'slack':
        return 'border-emerald-500/40 bg-slate-900/80 hover:border-emerald-500/70';
      case 'discord':
        return 'border-indigo-500/40 bg-slate-900/80 hover:border-indigo-500/70';
      case 'google-sheets':
        return 'border-cyan-500/40 bg-slate-900/80 hover:border-cyan-500/70';
      default:
        return 'border-slate-700/80 bg-slate-900/80 hover:border-slate-600';
    }
  };

  return (
    <div className={`relative min-w-[220px] rounded-xl p-4 transition-all duration-200 border ${getBorderColor()}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
          {getProviderIcon()}
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {provider.replace('-', ' ')}
          </span>
          <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{data.label || 'Action Step'}</h4>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40 px-2 py-1 rounded border border-slate-800 font-mono">
        <span>{data.actionType || 'execute'}</span>
        {data.channel && <span className="text-emerald-400">{data.channel}</span>}
        {data.to && <span className="text-rose-400 truncate max-w-[90px]">{data.to}</span>}
        {data.spreadsheetId && <span className="text-cyan-400 truncate max-w-[90px]">{data.spreadsheetId}</span>}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary-500 !border-2 !border-slate-900"
      />
    </div>
  );
};

export default memo(ActionNode);
