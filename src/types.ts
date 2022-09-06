export enum AlertTypes {
    Error = "error",
    Info = "info",
    Success = "success",
    Warning = "warning",
    Neutral = "neutral",
}

export enum Rating {
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
}

export interface Run {
    id: string; // uuid
    prompt: string; // text prompt
    steps: number; // --ddim_steps
    seed: number; // --seed
    started_at: Date;
    ended_at?: Date;
    elapsed?: number; // milliseconds
    image_name?: string; //
    rating: Rating; // 1-5
}
