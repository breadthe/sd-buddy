import { copying } from "./store";

export async function copyToClipboard(text: string) {
  if (!navigator.clipboard) {
    return;
  }

  try {
    copying.set(true);
    await navigator.clipboard.writeText(text);

    setTimeout(() => {
      copying.set(false);
    }, 2000);
  } catch (error) {
    copying.set(false);
    console.error("failed copying to clipboard", error);
  }
}
