import { readable, writable } from "svelte/store";
import type { Run } from "./types";

export const stableDiffusionDirectory = writable('');

// Use this in lieu of an event bus to assign a prompt from a saved run to the prompt input
export const reusePrompt = writable('');

// Store runs to localStorage for now
function createRunsStore() {
    let storedRuns = JSON.parse(localStorage.getItem("runs")) || [];
    const { subscribe, set } = writable(storedRuns);

    return {
        subscribe,
        set: (runsJson: string) => {
            localStorage.setItem("runs", runsJson);
        },
        push: (run: Run) => {
            const newRuns = storedRuns;

            newRuns.push(run);

            storedRuns = newRuns;
            localStorage.setItem("runs", JSON.stringify(storedRuns));
            set(storedRuns);
        },
        remove: (run: Run) => {
            const ix = storedRuns.findIndex((r: Run) => r.id === run.id);
            if (ix > -1) {
                storedRuns.splice(ix, 1);

                storedRuns = storedRuns;
                localStorage.setItem("runs", JSON.stringify(storedRuns));
                set(storedRuns);
            }
        },
        clear: () => {
            storedRuns = [];

            localStorage.setItem("runs", JSON.stringify([]));
            set(storedRuns);
        }
    };
}

export const runs = createRunsStore();
