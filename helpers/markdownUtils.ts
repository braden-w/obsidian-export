import { MarkdownFileSummary, Slug } from "../types.d.ts"

export function removeFileExtension(
  fileName: MarkdownFileSummary["fileName"]
): string {
  return fileName.slice(0, -3)
}

export const slugifyFileName = (fileName: string): Slug => {
  return fileName
    .trim()
    .replace(/[\s-—]+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase()
}
