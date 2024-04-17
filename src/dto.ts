export interface Contest {
    id: string;
    name: string;
}

export interface Problem {
    id: number;
    short_name: string;
    submissions_limit: number;
    needs_rejudge: boolean;
    round: number;
    problem: number;
}
