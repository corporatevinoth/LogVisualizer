import { ParsedData, LogEntry, ErrorFrequencyPoint } from '../types';

export const parseLogs = (input: string): ParsedData => {
    let logs: LogEntry[] = [];

    // Try parsing as a single JSON array first, then NDJSON
    try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
            logs = parsed;
        } else if (typeof parsed === 'object') {
            logs = [parsed];
        }
    } catch (e) {
        // If not valid JSON array, try line by line (NDJSON or just garbage)
        const lines = input.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
                const log = JSON.parse(trimmed);
                logs.push(log);
            } catch (err) {
                // Skip invalid lines
                console.warn('Failed to parse line:', line);
            }
        }
    }

    // Normalize and Analyze
    const piiCount = { email: 0, creditCard: 0 };
    let totalErrors = 0;
    const slowestRequests: LogEntry[] = [];
    const errorFreqMap: Record<string, number> = {};

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const ccRegex = /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g;

    // Enforce consistent structure just in case
    logs = logs.map(log => ({
        ...log,
        timestamp: log.timestamp || new Date().toISOString(),
        service_name: log.service_name || 'unknown-service',
        // Coerce status to number if string
        status_code: Number(log.status_code) || 200,
        duration_ms: Number(log.duration_ms) || 0,
    }));

    logs.forEach(log => {
        // PII Detection in message
        const msg = log.message || '';
        const stringified = JSON.stringify(log); // Check everything just in case, but user said message field
        // Actually user said "Scan the message field". I'll stick to stringified to be safe or just message.
        // Let's stick to message + maybe other string fields if needed. Stringified is safer.

        const emailMatches = stringified.match(emailRegex);
        if (emailMatches) piiCount.email += emailMatches.length;

        const ccMatches = stringified.match(ccRegex);
        if (ccMatches) piiCount.creditCard += ccMatches.length;

        // Metrics
        if (log.status_code >= 400) {
            totalErrors++;
            // Bin by minute for chart
            const date = new Date(log.timestamp);
            if (!isNaN(date.getTime())) {
                const key = date.toISOString().slice(0, 16).replace('T', ' '); // YYYY-MM-DD HH:mm
                errorFreqMap[key] = (errorFreqMap[key] || 0) + 1;
            }
        }

        if (log.duration_ms > 2000) {
            slowestRequests.push(log);
        }
    });

    // Sort slowest requests descending
    slowestRequests.sort((a, b) => b.duration_ms - a.duration_ms);

    // Format error frequency for chart
    const errorFrequency: ErrorFrequencyPoint[] = Object.entries(errorFreqMap)
        .map(([timeSlot, count]) => ({ timeSlot, count }))
        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    return {
        logs,
        piiCount,
        metrics: {
            totalErrors,
            slowestRequests: slowestRequests.slice(0, 5), // Top 5
            errorFrequency
        }
    };
};
