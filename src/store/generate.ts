import { derived, writable } from "svelte/store";
import type { CustomVar, Run } from "../types";

export const prompt = writable("")

// Flag that indicates there's a run in progress
export const isGenerating = writable(false)

// Elapsed time for the current run
export const elapsed = writable(0) // in ms

// Use this in lieu of an event bus to assign a prompt from a saved run to the prompt input
export const reusePrompt = writable(<Run>{})

// Filter runs by a prompt string (partial or full)
export const runFilter = writable("")

// Sort runs by run_at date
const storedRunSortOrder = localStorage.getItem("runSortOrder") || "asc"
export const runSortOrder = writable(storedRunSortOrder ? storedRunSortOrder : "asc")
runSortOrder.subscribe((value: string) => {
    localStorage.setItem("runSortOrder", value);
})


// The path of the python executable
function createPythonPath() {
    let storedPythonPath =
        JSON.parse(localStorage.getItem("pythonPath")) || "";
    const { subscribe, set } = writable(storedPythonPath);

    return {
        subscribe,
        set: (path: string) => {
            localStorage.setItem("pythonPath", JSON.stringify(path));
            set(path);
        },
    };
}
export const pythonPath = createPythonPath();


// The directory where Stable Diffusion is installed
function createStableDiffusionDirectory() {
    let storedStableDiffusionDirectory =
        JSON.parse(localStorage.getItem("stableDiffusionDirectory")) || "";
    const { subscribe, set } = writable(storedStableDiffusionDirectory);

    return {
        subscribe,
        set: (sdDir: string) => {
            localStorage.setItem("stableDiffusionDirectory", JSON.stringify(sdDir));
            set(sdDir);
        },
    };
}
export const stableDiffusionDirectory = createStableDiffusionDirectory();


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
        },
    };
}
export const runs = createRunsStore();

// derived store for runs filtered by runFilter
export const filteredRuns = derived([runs, runFilter], ([$runs, $runFilter]) => {
    if ($runFilter === "") return $runs

    return $runs.filter((run: Run) => run.prompt.toLowerCase().includes($runFilter.toLowerCase()))
}
);

// derived store for filteredRuns sorted by ended_at date
export const sortedRuns = derived([filteredRuns, runSortOrder], ([$filteredRuns, $runSortOrder]) => {
    return $filteredRuns.sort(
        (a: Run, b: Run) =>
            $runSortOrder === "asc" ? Date.parse(b.ended_at) - Date.parse(a.ended_at) : Date.parse(a.ended_at) - Date.parse(b.ended_at)
    )
});

// derive extractedVars from prompt, Example ["$age", "$gender"]
export const extractedVars = derived(prompt, $prompt => extractVars($prompt))

function extractVars(prompt) {
    const pattern = /\B\$[a-zA-z]+/g; // find all tokens starting with $
    const re = new RegExp(pattern);
    return [...prompt.matchAll(re)].flatMap(p => p)
}


function createCustomVarsStore() {
    let storedCustomVars = []
    const { subscribe, set } = writable(storedCustomVars);

    return {
        subscribe,
        set,
        remove: (customVar: CustomVar) => {
            const newCustomVars = storedCustomVars;

            const ix = newCustomVars.findIndex((cv: CustomVar) => cv.name === customVar.name);
            if (ix > -1) {
                newCustomVars.splice(ix, 1);

                storedCustomVars = newCustomVars;
                set(storedCustomVars);
            }
        },
        push: (customVar: CustomVar) => {
            const newCustomVars = storedCustomVars;

            const ix = newCustomVars.findIndex((cv: CustomVar) => cv.name === customVar.name);
            if (ix > -1) {
                newCustomVars[ix] = customVar
            } else {
                newCustomVars.push(customVar)
            }

            storedCustomVars = newCustomVars
            set(storedCustomVars);
        }
    };
}
export const customVars = createCustomVarsStore() // [{name: "age", values: ["old", "young"]}, {name: "gender", values: ["woman", "man", "child"]}]


// derive promptStrings from prompt and customVars
export const promptStrings = derived([prompt, customVars], ([$prompt, $customVars]) => buildPromptStrings($prompt, $customVars))

function buildPromptStrings(prompt, customVars) {
    const vars = customVars
    let newPromptStrings = null;

    if (!vars.length) return
    // console.log(vars)

    // loop through all the vars
    vars.forEach((customVar) => {
        // when we start out the custom var doesn't have any values
        if (!customVar.values) return

        // if this is the first loop, init the promptstrings array with the blankest version of the prompt
        if (!newPromptStrings) newPromptStrings = [prompt];
        const temp = []
        for (let partialPrompt of newPromptStrings) {
            for (let val of customVar.values) {
                // replace all the $vars in the prompt
                const promptString = partialPrompt.replaceAll(`$${customVar.name}`, val)
                temp.push(promptString)
                // console.log(promptString)
            }
        }
        newPromptStrings = temp
    })
    // you can randomize later if you want

    // assign it to the store
    return newPromptStrings
}


// determine if all custom variable fields are filled (each field has at least 1 value)
export const allCustomVarsAreFilled = derived([extractedVars, customVars], ([$extractedVars, $customVars]) =>
    $extractedVars.every((ev) =>
        $customVars.find((cv) => `$${cv.name}` === ev && cv.values)
    )
)
