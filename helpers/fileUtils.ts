import { MarkdownFileSummary } from "../types.d.ts"
import { getSlugToSummaryMap } from "./collection/slugToSummaryMap.ts"
import { isCriteriaMet } from "./isCriteriaMet.ts"

export async function getMarkdownFileSlugs(
  isCriteriaMet?: (summary: MarkdownFileSummary) => boolean
): Promise<Set<string>> {
  const summaries = await getSlugToSummaryMap()
  const slugs = new Set<string>()
  for (const [slug, summary] of summaries) {
    if (isCriteriaMet && !isCriteriaMet(summary)) continue
    slugs.add(slug)
  }
  return slugs
}

export async function getMarkdownFilePaths(
  isCriteriaMet?: (summary: MarkdownFileSummary) => boolean
): Promise<Set<string>> {
  const summaries = await getSlugToSummaryMap()
  const filePaths = new Set<string>()
  for (const [, summary] of summaries) {
    if (isCriteriaMet && !isCriteriaMet(summary)) continue
    const filePath = `${summary.dirPath}/${summary.fileName}`
    filePaths.add(filePath)
  }
  return filePaths
}

export async function getImageFiles(): Promise<Set<string>> {
  const summaries = await getSlugToSummaryMap()
  const imageFiles = new Set<string>()
  const wikilinkRegex = /\[\[(.+?)\]\]/g
  for (const [, summary] of summaries) {
    if (!isCriteriaMet(summary)) continue
    let match
    while ((match = wikilinkRegex.exec(summary.fileText)) !== null) {
      imageFiles.add(match[1])
    }
  }
  return imageFiles
}
