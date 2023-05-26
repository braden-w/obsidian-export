import { contentDirectory } from "../mod.ts"
import { Slug, MarkdownFileSummary } from "../types.d.ts"
import { applyToFilesRecursive } from "./fileUtils/applyToFilesRecursive.ts"
import { isCriteriaMet } from "./isCriteriaMet.ts"
import { getMarkdownFileSummary } from "./markdownUtils.ts"

export type MarkdownFileSummaries = Map<Slug, MarkdownFileSummary>
export async function getMarkdownFileSummaries(): Promise<MarkdownFileSummaries> {
  const markdownSlugToSummaries = new Map<Slug, MarkdownFileSummary>()

  const processFileEntry = async (filePath: string, fileName: string) => {
    if (!filePath.endsWith(".md")) return
    const markdownSummary = await getMarkdownFileSummary(
      filePath as `${string}/${string}.md`,
      fileName
    )
    markdownSlugToSummaries.set(markdownSummary.slug, markdownSummary)
  }

  await applyToFilesRecursive(contentDirectory, processFileEntry)
  return markdownSlugToSummaries
}

export async function getMarkdownFileSlugs(
  isCriteriaMet?: (summary: MarkdownFileSummary) => boolean
): Promise<Set<string>> {
  const summaries = await getMarkdownFileSummaries()
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
  const summaries = await getMarkdownFileSummaries()
  const filePaths = new Set<string>()
  for (const [, summary] of summaries) {
    if (isCriteriaMet && !isCriteriaMet(summary)) continue
    filePaths.add(summary.filePath)
  }
  return filePaths
}

export async function getImageFiles(): Promise<Set<string>> {
  const summaries = await getMarkdownFileSummaries()
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
