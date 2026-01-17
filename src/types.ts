export interface LogEntry {
    timestamp: string;
    service_name: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'FATAL' | 'UNKNOWN';
    status_code?: number;
    duration_ms: number;
    message: string;
    interaction_target?: string;
    raw?: string;
}

export interface ParsedData {
    logs: LogEntry[];
    piiCount: {
        email: number;
        creditCard: number;
    };
    metrics: {
        totalErrors: number;
        slowestRequests: LogEntry[];
        errorFrequency: ErrorFrequencyPoint[];
    }
}

export interface ErrorFrequencyPoint {
    timeSlot: string;
    count: number;
}
