import { derived, writable } from "svelte/store";
import type { CustomVar, Run } from "../types";
// import { get, set } from "tauri-settings";

export const prompt = writable("")

// Use this in lieu of an event bus to assign a prompt from a saved run to the prompt input
export const reusePrompt = writable(<Run>{});

// Store runs to localStorage for now
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

/* type directory = {
    stableDiffusionDirectory: string;
};
const getStableDiffusionDirectory = async () => {
    let sdDir = "";

    await get<directory>("stableDiffusionDirectory")
        .then((sdDirectory: string) => sdDir = sdDirectory)
        .catch((err) => {
            // do nothing, the user will have to set the directory
        });

    return sdDir;
}
const setStableDiffusionDirectory = async (sdDirectory: string) => {
    await set<directory>("stableDiffusionDirectory", sdDirectory)
        .then(() => {
            // update the store
            stableDiffusionDirectory.set(sdDirectory);
            console.log(`Stable Diffusion directory saved: ${sdDirectory}`)
        })
        .catch((err) => console.log(err));
}
async function stableDiffusionDirectoryStore() {
    let storedStableDiffusionDirectory = await getStableDiffusionDirectory();
    const { subscribe, set } = writable(storedStableDiffusionDirectory);

    return {
        subscribe,
        set,
        register: (sdDirectory: string) => setStableDiffusionDirectory(sdDirectory),
    };
}
export const stableDiffusionDirectory = await stableDiffusionDirectoryStore(); */


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
