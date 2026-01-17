import React, { useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface InputPanelProps {
    onDataParsed: (text: string) => void;
    error?: string | null;
}

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
        <div className="flex flex-col h-full p-4 space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                <FileText size={20} />
                <h2 className="text-lg font-bold tracking-wide uppercase">Data Input</h2>
            </div>

            <div className="flex-1 flex flex-col space-y-2">
                <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                    Raw JSON Logs
                </label>
                <textarea
                    className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none custom-scrollbar"
                    placeholder="Paste logs here..."
                    onChange={handleTextChange}
                />
            </div>

            <div className="pt-4 border-t border-slate-700">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json,.txt"
                    onChange={handleFileUpload}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-400 rounded-md flex items-center justify-center space-x-2 transition-colors uppercase text-sm font-bold tracking-wider"
                >
                    <Upload size={16} />
                    <span>Browse File</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-md flex items-start space-x-2">
                    <AlertCircle size={16} className="text-red-400 mt-0.5" />
                    <p className="text-xs text-red-300">{error}</p>
                </div>
            )}
        </div>
    );
}
