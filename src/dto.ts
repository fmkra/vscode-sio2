export interface Contest {
    id: string;
    name: string;
}

export interface Problem {
    id: number;
    short_name: string;
    full_name: string;
    submissions_limit: number;
    submissions_left: number | null;
    round: number;
    user_result: {
        score: string;
        status: unknown; // TODO: fix
    };
    can_submit: boolean;
    statement_extension: ".zip" | ".pdf" | ".ps" | ".html" | ".txt" | null;
}

export interface Submit {
    id: number;
    score: string | null;
    date: string;
}

export interface SubmitsInfo {
    submissions: Submit[];
    is_truncated: boolean;
}

export interface SubmitCode {
    lang: string;
    code: string;
}
