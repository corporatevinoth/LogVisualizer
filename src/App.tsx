import { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { InputPanel } from './components/InputPanel';
import { Dashboard } from './components/Dashboard';
import { FlowCanvas } from './components/Flow/FlowCanvas';
import { parseLogs } from './utils/logParser';
import { ParsedData } from './types';

function App() {
    const [logText, setLogText] = useState('');
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);

    const handleInput = useCallback((text: string) => {
        setLogText(text);
        if (!text.trim()) {
            setParsedData(null);
            setParseError(null);
            return;
        }
        try {
            const data = parseLogs(text);
            setParsedData(data);
            setParseError(null);
        } catch (e) {
            console.error(e);
            setParseError("Invalid format. Please paste JSON array or NDJSON.");
        }
    }, []);

    return (
        <div className="bg-slate-900 text-slate-100 min-h-screen font-sans selection:bg-cyan-500/30">
            <Layout
                leftPanel={<InputPanel onDataParsed={handleInput} error={parseError} />}
                centerPanel={<FlowCanvas data={parsedData} />}
                rightPanel={<Dashboard data={parsedData} />}
            />
        </div>
    );
}

export default App;
