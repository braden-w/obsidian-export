import { MarkdownFileSummary } from "../../types.d.ts"
import { isCriteriaMet } from "../markdown/isCriteriaMet.ts"

export function getMarkdownFileSlugs({
  markdownFileSummaries,
  isCriteriaMet,
}: {
  markdownFileSummaries: MarkdownFileSummary[]
  isCriteriaMet?: (summary: MarkdownFileSummary) => boolean
}): Set<string> {
  const slugs = new Set<string>()
  for (const summary of markdownFileSummaries) {
    if (isCriteriaMet && !isCriteriaMet(summary)) continue
    slugs.add(summary.slug)
  }
  return slugs
}

export function getMarkdownFilePaths({
  markdownFileSummaries,
  isCriteriaMet,
}: {
  markdownFileSummaries: MarkdownFileSummary[]
  isCriteriaMet?: (summary: MarkdownFileSummary) => boolean
}): Set<string> {
  const filePaths = new Set<string>()
  for (const summary of markdownFileSummaries) {
    if (isCriteriaMet && !isCriteriaMet(summary)) continue
    const filePath = `${summary.dirPath}/${summary.fileName}`
    filePaths.add(filePath)
  }
  return filePaths
}

/** Returns a set of all image files referenced in the markdown files. */
export function getReferencedImageFiles({
  markdownFileSummaries,
}: {
  markdownFileSummaries: MarkdownFileSummary[]
}): Set<string> {
  const imageFiles = new Set<string>()
  const wikilinkRegex = /\[\[(.+?)\]\]/g
  for (const summary of markdownFileSummaries) {
    if (!isCriteriaMet(summary)) continue
    let match
    while ((match = wikilinkRegex.exec(summary.fileText)) !== null) {
      imageFiles.add(match[1])
    }
  }
  return imageFiles
}
