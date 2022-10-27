import { copying } from "./store"

export async function copyToClipboard(text: string) {
    if (!navigator.clipboard) return

    try {
        copying.set(true)
        await navigator.clipboard.writeText(text)

        setTimeout(() => {
            copying.set(false)
        }, 2000)
    } catch (error) {
        copying.set(false)
        console.error("failed copying to clipboard", error)
    }
}


// Theming functions
export function setIsDark(dark: boolean) {
    const htmlNode = document.querySelector("html")
    dark ? htmlNode?.classList.add("dark") : htmlNode?.classList.remove("dark")
}

export function isDark() {
    return document.querySelector("html")?.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function setTheme(theme: string) {
    if (theme === "light") {
        return setIsDark(false)
    }

    if (theme === "dark") {
        return setIsDark(true)
    }

    if (theme === "automatic" || theme === undefined) {
        return setIsDark(
            window.matchMedia("(prefers-color-scheme: dark)").matches
        )
    }
}
