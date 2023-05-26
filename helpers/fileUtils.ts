import { contentDirectory } from "../mod.ts"
import { MarkdownFileSummary, Slug } from "../types.d.ts"
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
    if (!fileName.endsWith(".md")) return
    await addMarkdownFileToSlugToSummaryMap({
      file: {
        dirPath: dirPath as `${string}/${string}`,
        fileName: fileName as `${string}.md`,
      },
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
  file,
  map,
}: {
  file: {
    dirPath: `${string}/${string}`
    fileName: `${string}.md`
  }
  map: SlugToSummaryMap
}) {
  const markdownSummary = await generateMarkdownFileSummary(file)
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
