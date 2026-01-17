import { Handle, Position, NodeProps } from 'reactflow';
import { Server, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';
import clsx from 'clsx';

export type ServiceNodeData = {
    label: string;
    hasErrors: boolean;
    hasHighLatency: boolean;
    isDimmed?: boolean; // For interactivity
};

export function CustomNode({ data }: NodeProps<ServiceNodeData>) {
    const isDanger = data.hasErrors;
    const isWarning = data.hasHighLatency;

    return (
        <div className={clsx(
            "min-w-[180px] px-4 py-3 rounded-lg shadow-xl border-2 transition-all duration-300 backdrop-blur-md",
            data.isDimmed ? "opacity-20 grayscale" : "opacity-100",
            isDanger ? "bg-red-950/60 border-red-500 shadow-red-500/20" :
                isWarning ? "bg-amber-950/60 border-amber-500 shadow-amber-500/20" :
                    "bg-slate-900/80 border-cyan-500 shadow-cyan-500/20"
        )}>
            <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-3 !h-3" />

            <div className="flex items-center space-x-3">
                <div className={clsx(
                    "p-2.5 rounded-full shadow-inner",
                    isDanger ? "bg-red-500/20 text-red-400 shadow-red-900/50" :
                        isWarning ? "bg-amber-500/20 text-amber-400 shadow-amber-900/50" :
                            "bg-cyan-500/20 text-cyan-400 shadow-cyan-900/50"
                )}>
                    {isWarning ? <Clock size={20} /> : <Server size={20} />}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Service</span>
                    <span className={clsx("text-sm font-bold tracking-wide",
                        isDanger ? "text-red-200" :
                            isWarning ? "text-amber-200" :
                                "text-cyan-50"
                    )}>
                        {data.label}
                    </span>
                </div>
            </div>

            {(isDanger || isWarning) && (
                <div className="mt-3 pt-2 border-t border-white/10 flex space-x-2">
                    {isDanger && (
                        <div className="flex items-center space-x-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">
                            <AlertOctagon size={10} />
                            <span>CRITICAL</span>
                        </div>
                    )}
                    {isWarning && (
                        <div className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <AlertTriangle size={10} />
                            <span>SLOW</span>
                        </div>
                    )}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-3 !h-3" />
        </div>
    );
}
