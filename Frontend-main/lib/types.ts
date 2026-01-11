export interface Trace {
    function: string;
    file: string;
    inputs: Record<string, any>;
    output: any;
    code: string;
    start_time?: string;
    end_time?: string;
    duration_ms?: number;
    explanation?: string;
}

export interface ApiResponse {
    result: any;
    traces: Trace[];
    explain_text: string;
}

export interface EndpointConfig {
    id: string;
    path: string;
    method: 'GET' | 'POST';
    title: string;
    description: string;
    formType: 'simple' | 'full' | 'resume' | 'none';
}
