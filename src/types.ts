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
