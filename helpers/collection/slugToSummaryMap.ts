import { contentDirectory } from "../../mod.ts"
import { Slug, MarkdownFileSummary } from "../../types.d.ts"
import {
  ProcessFileFn,
  applyToFilesRecursive,
} from "../file/applyToFilesRecursive.ts"
import { generateMarkdownFileSummary } from "../markdown/generateMarkdownFileSummary.ts"

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
