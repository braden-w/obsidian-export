import { contentDirectory } from "../mod.ts"
import { Slug, MarkdownFileSummary } from "../types.d.ts"
import {
  ProcessFileFn,
  applyToFilesRecursive,
} from "./fileUtils/applyToFilesRecursive.ts"
import { isCriteriaMet } from "./isCriteriaMet.ts"
import { getMarkdownFileSummary } from "./markdownUtils.ts"

export type SlugToSummaryMap = Map<Slug, MarkdownFileSummary>

/** Returns a map of MarkdownFileSummary objects, keyed by slug. */
export async function getSlugToSummaryMap(): Promise<SlugToSummaryMap> {
  const slugToSummaryMap: SlugToSummaryMap = new Map()

  const processFileEntry: ProcessFileFn = async ({ filePath, fileName }) => {
    if (!filePath.endsWith(".md")) return
    const markdownSummary = await getMarkdownFileSummary({
      entryPath: filePath as `${string}/${string}.md`,
      entryName: fileName,
    })
    slugToSummaryMap.set(markdownSummary.slug, markdownSummary)
  }

  await applyToFilesRecursive({
    dirPath: contentDirectory,
    processFileFn: processFileEntry,
  })
  return slugToSummaryMap
}

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
    filePaths.add(summary.filePath)
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
