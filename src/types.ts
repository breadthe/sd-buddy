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

export interface CustomVar {
    name: string;
    values: string[];
}

export interface Run {
    id: string; // uuid
    prompt: string; // text prompt
    steps: number; // --ddim_steps
    samples: number; // --n_samples
    scale: number; // --scale
    iter: number; // --n_iter
    height: number; // --H, default 512
    width: number; // --W, default 512
    seed: number; // --seed
    started_at: Date;
    ended_at?: Date;
    elapsed?: number; // milliseconds
    image_name?: string; //
    rating: Rating; // 1-5
}

// The queue is used to push Txt2Img or Img2Txt runs to be processed sequentially
export interface Queue {
    items: QueueItem[];
}

export interface QueueItem {
    id: string; // uuid
    run: Run;
    status: QueueItemStatus;
    started_at: Date;
    ended_at?: Date;
    elapsed?: number; // milliseconds
}

export enum QueueItemStatus {
    Pending = "pending",
    Skipped = "skipped",
    Running = "running",
    Completed = "completed",
    Failed = "failed",
}
