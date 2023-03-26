import { Slug, MarkdownFileSummary } from "../types.d.ts"
import { slugifyFileName } from "./slugifyFileName.ts"

export async function getMarkdownFileSummaries(
  directoryPath: string
): Promise<Map<Slug, MarkdownFileSummary>> {
  const markdownFiles = new Map<Slug, MarkdownFileSummary>()

  async function traverseDirectory(path: string) {
    for await (const dirEntry of Deno.readDir(path)) {
      const entryPath = `${path}/${dirEntry.name}` as const
      if (dirEntry.isDirectory) {
        await traverseDirectory(entryPath)
      } else {
        await processFileEntry(entryPath, dirEntry.name)
      }
    }
  }

  async function processFileEntry(entryPath: string, entryName: string) {
    if (entryPath.endsWith(".md")) {
      const fileName = entryName as `${string}.md`
      const fileNameWithoutExtension = removeFileExtension(fileName)
      const filePath = entryPath as `${string}.md`
      const fileText = await Deno.readTextFile(filePath)
      const slug = slugifyFileName(fileNameWithoutExtension)
      markdownFiles.set(slug, {
        fileName,
        fileNameWithoutExtension,
        filePath,
        fileText,
      })
    }
  }

  function removeFileExtension(fileName: string): string {
    return fileName.slice(0, -3)
  }

  await traverseDirectory(directoryPath)
  return markdownFiles
}

export async function getMarkdownFileSlugs(
  directoryPath: string,
  isCriteriaMet?: (summary: MarkdownFileSummary) => boolean
): Promise<Set<string>> {
  const summaries = await getMarkdownFileSummaries(directoryPath)
  const slugs = new Set<string>()
  for (const [slug, summary] of summaries) {
    if (isCriteriaMet && !isCriteriaMet(summary)) continue
    slugs.add(slug)
  }
  return slugs
}

export async function getMarkdownFilePaths(
  directoryPath: string,
  isCriteriaMet?: (summary: MarkdownFileSummary) => boolean
): Promise<Set<string>> {
  const summaries = await getMarkdownFileSummaries(directoryPath)
  const filePaths = new Set<string>()
  for (const [, summary] of summaries) {
    if (isCriteriaMet && !isCriteriaMet(summary)) continue
    filePaths.add(summary.filePath)
  }
  return filePaths
}

export async function getImageFiles(
  directoryPath: string
): Promise<Set<string>> {
  const summaries = await getMarkdownFileSummaries(directoryPath)
  const imageFiles = new Set<string>()
  const wikilinkRegex = /\[\[(.+?)\]\]/g
  for (const [, summary] of summaries) {
    let match
    while ((match = wikilinkRegex.exec(summary.fileText)) !== null) {
      imageFiles.add(match[1])
    }
  }
  return imageFiles
}
