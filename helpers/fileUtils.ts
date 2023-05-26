import { contentDirectory } from "../mod.ts"
import { Slug, MarkdownFileSummary } from "../types.d.ts"
import {
  ProcessFileFn,
  applyToFilesRecursive,
} from "./fileUtils/applyToFilesRecursive.ts"
import { isCriteriaMet } from "./isCriteriaMet.ts"
import { generateMarkdownFileSummary } from "./markdownUtils.ts"

export type SlugToSummaryMap = Map<Slug, MarkdownFileSummary>

/** Returns a map of MarkdownFileSummary objects, keyed by slug. */
export async function getSlugToSummaryMap(): Promise<SlugToSummaryMap> {
  const slugToSummaryMap: SlugToSummaryMap = new Map()

  const processFileEntry: ProcessFileFn = async ({ dirPath, fileName }) => {
    if (!dirPath.endsWith(".md")) return
    const filePath = `${dirPath}/${fileName}`
    await addMarkdownFileToSlugToSummaryMap({
      file: { filePath, fileName },
      map: slugToSummaryMap,
    })
  }

  await applyToFilesRecursive({
    dirPath: contentDirectory,
    processFileFn: processFileEntry,
  })
  return slugToSummaryMap
}

async function addMarkdownFileToSlugToSummaryMap({
  file: { filePath, fileName },
  map,
}: {
  file: {
    filePath: string
    fileName: string
  }
  map: SlugToSummaryMap
}) {
  const markdownSummary = await generateMarkdownFileSummary({
    entryPath: filePath as `${string}/${string}.md`,
    fileName: fileName as `${string}.md`,
  })
  map.set(markdownSummary.slug, markdownSummary)
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
