import * as systemStore from './system'
import * as generateStore from './generate'

const system = {...systemStore}
const generate = {...generateStore}

export { system, generate }

// export default {
//     ...system,
    // copying: system.copying,

    // ...generate,
    // prompt: generate.prompt,
    // reusePrompt: generate.reusePrompt,
    // stableDiffusionDirectory: generate.stableDiffusionDirectory,
    // runs: generate.runs,
    // extractedVars: generate.extractedVars,
    // customVars: generate.customVars,
    // promptStrings: generate.promptStrings,
    // allCustomVarsAreFilled: generate.allCustomVarsAreFilled,
// }
