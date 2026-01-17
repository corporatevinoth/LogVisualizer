import { ParsedData } from '../types';
import { Activity, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { ErrorChart } from './Dashboard/ErrorChart';

interface DashboardProps {
    data: ParsedData | null;
}

export function Dashboard({ data }: DashboardProps) {
    if (!data) {
        return (
            <div className="flex flex-col h-full p-4 items-center justify-center text-slate-500">
                <Activity size={48} className="mb-4 opacity-20" />
                <p className="text-sm">No data loaded</p>
            </div>
        )
    }

    const { piiCount, metrics } = data;

    return (
        <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                <Activity size={20} />
                <h2 className="text-lg font-bold tracking-wide uppercase">Dashboard</h2>
            </div>

            {/* PII Detection */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                    <ShieldAlert size={16} />
                    <h3 className="text-sm font-bold uppercase">Sensitive Data (PII)</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Email Addresses</span>
                        <span className="text-white font-mono font-bold bg-slate-700 px-2 py-0.5 rounded">
                            {piiCount.email}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Credit Card Nums</span>
                        <span className="text-white font-mono font-bold bg-slate-700 px-2 py-0.5 rounded">
                            {piiCount.creditCard}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error Frequency */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center space-x-2 text-amber-400 mb-3">
                    <AlertTriangle size={16} />
                    <h3 className="text-sm font-bold uppercase">Error Frequency</h3>
                </div>
                <div className="h-40 bg-slate-900/50 rounded border border-slate-700 border-dashed p-2">
                    <ErrorChart data={metrics.errorFrequency} />
                </div>
            </div>

            {/* Slowest Requests */}
            <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center space-x-2 text-red-400 mb-3">
                    <Clock size={16} />
                    <h3 className="text-sm font-bold uppercase">Slowest Requests</h3>
                </div>
                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {metrics.slowestRequests.map((req, i) => (
                        <div key={i} className="bg-slate-900/80 p-2 rounded border-l-2 border-red-500 text-xs">
                            <div className="flex justify-between mb-1">
                                <span className="text-cyan-300 font-semibold">{req.service_name}</span>
                                <span className="text-red-300 font-mono">{req.duration_ms}ms</span>
                            </div>
                            <div className="text-slate-500 truncate" title={req.message}>
                                {req.message}
                            </div>
                        </div>
                    ))}
                    {metrics.slowestRequests.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No high latency requests found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
