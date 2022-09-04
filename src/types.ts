export enum AlertTypes {
    Error = "error",
    Info = "info",
    Success = "success",
    Warning = "warning",
    Neutral = "neutral",
}

export interface Run {
    id: string; // uuid
    prompt: string; // text prompt
    steps: number; // --ddim_steps
    started_at: Date;
    ended_at?: Date;
    elapsed?: number; // milliseconds
    image_name?: string; //
}
