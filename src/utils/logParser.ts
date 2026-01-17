import { ParsedData, LogEntry, ErrorFrequencyPoint } from '../types';

export const parseLogs = (input: string): ParsedData => {
    let logs: LogEntry[] = [];

    const rawLines = input.split('\n');
    const uniqueServices = new Set<string>();

    // 1. Try parsing whole input as JSON Array
    try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
            logs = parsed.map(normalizeJsonLog);
        } else if (typeof parsed === 'object') {
            logs = [normalizeJsonLog(parsed)];
        }
    } catch (e) {
        // 2. Fallback: Line-by-Line Parsing
        for (const line of rawLines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Try parsing line as JSON (NDJSON)
            try {
                const jsonLog = JSON.parse(trimmed);
                logs.push(normalizeJsonLog(jsonLog));
                continue;
            } catch (err) {
                // 3. Fallback: Text Heuristics
                const textLog = parseTextLine(trimmed);
                if (textLog) {
                    logs.push(textLog);
                }
            }
        }
    }

    // Analyze PII & Metrics
    const piiCount = { email: 0, creditCard: 0 };
    let totalErrors = 0;
    const slowestRequests: LogEntry[] = [];
    const errorFreqMap: Record<string, number> = {};

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const ccRegex = /\b(?:\d[ -]*?){13,16}\b/g;

    logs.forEach(log => {
        // PII
        const content = log.message + (log.raw || '');

        const emailMatches = content.match(emailRegex);
        if (emailMatches) piiCount.email += emailMatches.length;

        const ccMatches = content.match(ccRegex);
        if (ccMatches) piiCount.creditCard += ccMatches.length;

        // Errors: Status >= 400 OR Level == ERROR
        const isError = (log.status_code && log.status_code >= 400) || log.level === 'ERROR' || log.level === 'FATAL';

        if (isError) {
            totalErrors++;
            const date = new Date(log.timestamp);
            if (!isNaN(date.getTime())) {
                const key = date.toISOString().slice(0, 16).replace('T', ' ');
                errorFreqMap[key] = (errorFreqMap[key] || 0) + 1;
            }
        }

        // Latency > 2000
        if (log.duration_ms > 2000) {
            slowestRequests.push(log);
        }
    });

    slowestRequests.sort((a, b) => b.duration_ms - a.duration_ms);

    const errorFrequency: ErrorFrequencyPoint[] = Object.entries(errorFreqMap)
        .map(([timeSlot, count]) => ({ timeSlot, count }))
        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    return {
        logs,
        piiCount,
        metrics: {
            totalErrors,
            slowestRequests: slowestRequests.slice(0, 5),
            errorFrequency
        }
    };
};

/**
 * Normalizes a JSON object into our LogEntry structure
 */
function normalizeJsonLog(obj: any): LogEntry {
    const level = obj.level || (obj.status_code >= 400 ? 'ERROR' : 'INFO');
    return {
        timestamp: obj.timestamp || new Date().toISOString(),
        service_name: obj.service_name || obj.logger || 'Unknown Service',
        level: (['INFO', 'WARN', 'ERROR', 'DEBUG', 'FATAL'].includes(level) ? level : 'UNKNOWN') as any,
        status_code: Number(obj.status_code) || undefined,
        duration_ms: Number(obj.duration_ms) || 0,
        message: obj.message || JSON.stringify(obj),
        interaction_target: obj.interaction_target, // Trust JSON if it exists
        raw: JSON.stringify(obj)
    };
}

/**
 * Heuristic Text Parser
 */
function parseTextLine(line: string): LogEntry | null {
    // 1. Timestamp Detection (ISO-like or Spring Default)
    // Regex for: YYYY-MM-DD HH:mm:ss.SSS or similar
    const timestampMatch = line.match(/\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}(?:\.\d+)?/);
    const timestamp = timestampMatch ? timestampMatch[0] : new Date().toISOString();

    // 2. Level Detection
    const levelMatch = line.match(/\b(INFO|WARN|ERROR|DEBUG|FATAL)\b/);
    const level = levelMatch ? levelMatch[0] as any : 'UNKNOWN';

    // 3. Service Name Heuristic
    // Look for class names like "com.example.OrderController" or "[OrderService]"
    let service_name = 'Unknown Service';
    const bracketMatch = line.match(/\[([a-zA-Z0-9.\-_]+)\]/); // Matches [AuthService] or [thread-main] - imprecise but okay for backup

    // Better: Java Class format? " c.e.OrderController "
    const classMatch = line.match(/\s+([a-z]+\.[a-z]+\.[A-Z][a-zA-Z0-9]+)\s+/);

    if (classMatch) {
        // Extract just the class name "OrderController" from "com.example.controllers.OrderController"
        const parts = classMatch[1].split('.');
        service_name = parts[parts.length - 1];
    } else if (bracketMatch && !['main', 'nio', 'http'].some(k => bracketMatch[1].includes(k))) {
        service_name = bracketMatch[1];
    }

    // 4. Heuristic Interaction Target
    // "Calling [PaymentService]" or "Request to [PaymentService]" or "-> [PaymentService]"
    let interaction_target: string | undefined;
    const targetKeywords = /(?:Calling|Request to|Target:|->)\s+\[?([a-zA-Z0-9\-_]+)\]?/i;
    const targetMatch = line.match(targetKeywords);
    if (targetMatch) {
        interaction_target = targetMatch[1];
    }

    // 5. Heuristic Latency
    // "took 45ms", "duration=45", "45ms"
    let duration_ms = 0;
    const durationMatch = line.match(/(?:duration=|took\s+)?(\d+)\s*ms\b/i);
    if (durationMatch) {
        duration_ms = Number(durationMatch[1]);
    }

    return {
        timestamp,
        service_name,
        level,
        message: line,
        duration_ms,
        interaction_target,
        raw: line
    };
}
