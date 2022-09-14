import type { CustomVar } from "./types"
import { customVars, extractedVars, promptStrings } from "./store"

export const buildStrings = (prompt: string, customVarsArray: CustomVar[]) => {
    if (!prompt) {
        promptStrings.set([])
        return
    }

    const vars: CustomVar[] = customVarsArray

    let newPromptStrings: string[] = []

    if (!vars.length) return

    // loop through all the vars
    vars.forEach((customVar: CustomVar) => {
        // if this is the first loop, init the promptstrings array with the blankest version of the prompt
        if (!newPromptStrings.length) newPromptStrings = [prompt]
        const temp = []
        for (let partialPrompt of newPromptStrings) {
            for (let val of customVar.values) {
                // replace all the $vars in the prompt
                const promptString = partialPrompt.replaceAll(
                    `$${customVar.name}`,
                    val
                )
                temp.push(promptString)
            }
        }
        newPromptStrings = temp
    })
    // you can randomize later if you want

    // save it to the store
    promptStrings.set(newPromptStrings)
}

export const extractVars = (prompt: string) => {
    // clear the store
    customVars.set([])
    promptStrings.set([])

    const pattern = /\$[\w]+/gi // find all tokens starting with $
    const re = new RegExp(pattern)

    extractedVars.set([...prompt.matchAll(re)])
}
