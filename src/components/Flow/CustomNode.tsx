import { Handle, Position, NodeProps } from 'reactflow';
import { Server, AlertTriangle, AlertOctagon } from 'lucide-react';
import clsx from 'clsx';

export type ServiceNodeData = {
    label: string;
    hasErrors: boolean;
    hasHighLatency: boolean;
};

export function CustomNode({ data }: NodeProps<ServiceNodeData>) {
    const isDanger = data.hasErrors;
    const isWarning = data.hasHighLatency;

    return (
        <div className={clsx(
            "min-w-[180px] px-4 py-3 rounded-md shadow-lg border-2 transition-all duration-300 backdrop-blur-md",
            isDanger ? "bg-red-900/40 border-red-500 shadow-red-500/20" :
                isWarning ? "bg-amber-900/40 border-amber-500 shadow-amber-500/20" :
                    "bg-slate-800/80 border-cyan-500 shadow-cyan-500/20"
        )}>
            <Handle type="target" position={Position.Top} className="!bg-slate-400" />

            <div className="flex items-center space-x-3">
                <div className={clsx(
                    "p-2 rounded-full",
                    isDanger ? "bg-red-500/20 text-red-400" :
                        isWarning ? "bg-amber-500/20 text-amber-400" :
                            "bg-cyan-500/20 text-cyan-400"
                )}>
                    <Server size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Service</span>
                    <span className={clsx("text-sm font-bold",
                        isDanger ? "text-red-200" :
                            isWarning ? "text-amber-200" :
                                "text-white"
                    )}>
                        {data.label}
                    </span>
                </div>
            </div>

            {(isDanger || isWarning) && (
                <div className="mt-2 flex space-x-2">
                    {isDanger && (
                        <div className="flex items-center space-x-1 text-[10px] text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-500/30">
                            <AlertOctagon size={10} />
                            <span>ERRORS</span>
                        </div>
                    )}
                    {isWarning && (
                        <div className="flex items-center space-x-1 text-[10px] text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">
                            <AlertTriangle size={10} />
                            <span>LATENCY</span>
                        </div>
                    )}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
        </div>
    );
}
