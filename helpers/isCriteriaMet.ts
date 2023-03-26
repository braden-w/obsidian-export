export type MarkdownFileSummary = {
  fileName: `${string}.md`
  fileNameWithoutExtension: string
  filePath: `${string}.md`
  fileText: string
}

export function isCriteriaMet({ fileText }: MarkdownFileSummary) {
  return fileText.includes("status: DONE")
}
