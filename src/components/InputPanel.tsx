import React, { useRef } from 'react';
import { Upload, FileText, AlertCircle, Play } from 'lucide-react';

interface InputPanelProps {
    onDataParsed: (text: string) => void;
    error?: string | null;
}

const SAMPLE_LOGS = [
    `2023-11-20 10:15:30.450 INFO 12345 --- [main] com.example.OrderController : Received create order request`,
    `2023-11-20 10:15:30.500 INFO 12345 --- [main] com.example.OrderController : Calling [InventoryService] to check stock`,
    `2023-11-20 10:15:30.800 INFO 12345 --- [http-nio-8080-exec-1] com.example.InventoryService : Stock check successful took 25ms`,
    `2023-11-20 10:15:31.000 INFO 12345 --- [main] com.example.OrderController : Request to [PaymentService] for transaction`,
    `2023-11-20 10:15:33.200 ERROR 12345 --- [http-nio-8080-exec-2] com.example.PaymentService : Gateway timeout duration=2200ms processing cc 4455-1234-5678-9012`,
    `2023-11-20 10:15:33.250 WARN 12345 --- [main] com.example.OrderController : Payment failed, notifying user vinoth@example.com`
].join('\n');

export function InputPanel({ onDataParsed, error }: InputPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                onDataParsed(event.target.result as string);
            }
        };
        reader.readAsText(file);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onDataParsed(e.target.value);
    }

    return (
        <div className="flex flex-col h-full p-4 space-y-4 bg-slate-950 border-r border-slate-800">
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                <FileText size={20} />
                <h2 className="text-lg font-bold tracking-wide uppercase font-mono">Input Source</h2>
            </div>

            <div className="flex-1 flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                        Raw Logs (JSON or Text)
                    </label>
                    <button
                        onClick={() => onDataParsed(SAMPLE_LOGS)}
                        className="text-xs flex items-center space-x-1 text-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                        <Play size={12} />
                        <span>Load Sample</span>
                    </button>
                </div>

                <textarea
                    className="flex-1 w-full bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none custom-scrollbar placeholder:text-slate-700"
                    placeholder="Paste Spring Boot logs, JSON array, or any text logs here..."
                    onChange={handleTextChange}
                    spellCheck={false}
                />
            </div>

            <div className="pt-4 border-t border-slate-800">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json,.txt,.log"
                    onChange={handleFileUpload}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 rounded-lg flex items-center justify-center space-x-3 transition-all uppercase text-xs font-bold tracking-widest group"
                >
                    <Upload size={16} className="text-slate-500 group-hover:text-cyan-500 transition-colors" />
                    <span>Upload Log File</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start space-x-3 animate-pulse">
                    <AlertCircle size={16} className="text-red-400 mt-0.5" />
                    <p className="text-xs text-red-300 font-mono">{error}</p>
                </div>
            )}
        </div>
    );
}
