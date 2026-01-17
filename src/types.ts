export interface LogEntry {
    timestamp: string;
    service_name: string;
    status_code: number;
    duration_ms: number;
    message: string;
    interaction_target?: string; // Optional: another service this interacts with
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

export interface ProcessingError {
    line: number;
    message: string;
}
