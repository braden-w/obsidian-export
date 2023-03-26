import { isCriteriaMet, MarkdownFileSummary } from "./isCriteriaMet.ts"
import { slugifyFileName } from "./slugifyFileName.ts"

export async function getMarkdownFileSlugs(
  directoryPath: string
): Promise<Set<string>> {
  const markdownFiles = new Set<string>()
  for await (const dirEntry of Deno.readDir(directoryPath)) {
    const path = `${directoryPath}/${dirEntry.name}`
    if (dirEntry.isDirectory) {
      const subDirectoryMarkdownFiles = await getMarkdownFileSlugs(path)
      subDirectoryMarkdownFiles.forEach((markdownFile) => {
        markdownFiles.add(`${slugifyFileName(markdownFile)}`)
      })
    } else if (path.endsWith(".md")) {
      const fileName = dirEntry.name as `${string}.md`
      const fileNameWithoutExtension = fileName.slice(0, -3)
      const filePath = `${directoryPath}/${fileName}` as const
      const fileText = await Deno.readTextFile(filePath)
      if (
        !isCriteriaMet({
          fileName,
          fileNameWithoutExtension,
          filePath,
          fileText,
        })
      )
        continue
      markdownFiles.add(`${slugifyFileName(dirEntry.name.slice(0, -3))}`)
    }
  }
  return markdownFiles
}

export async function getMarkdownFilePaths(
  directoryPath: string
): Promise<Set<string>> {
  const markdownFiles = new Set<string>()
  for await (const dirEntry of Deno.readDir(directoryPath)) {
    const path = `${directoryPath}/${dirEntry.name}`
    if (dirEntry.isDirectory) {
      const subDirectoryMarkdownFiles = await getMarkdownFilePaths(path)
      subDirectoryMarkdownFiles.forEach((markdownFile) => {
        markdownFiles.add(markdownFile)
      })
    } else if (path.endsWith(".md")) {
      const fileName = dirEntry.name as `${string}.md`
      const fileNameWithoutExtension = fileName.slice(0, -3)
      const filePath = `${directoryPath}/${fileName}` as const
      const fileText = await Deno.readTextFile(filePath)
      if (
        !isCriteriaMet({
          fileName,
          fileNameWithoutExtension,
          filePath,
          fileText,
        })
      )
        continue
      markdownFiles.add(filePath)
    }
  }
  return markdownFiles
}

type Slug = string
export async function getMarkdownFileSummaries(
  directoryPath: string
): Promise<Map<Slug, MarkdownFileSummary>> {
  const markdownFiles = new Map<Slug, MarkdownFileSummary>()

  async function traverseDirectory(path: string) {
    for await (const dirEntry of Deno.readDir(path)) {
      const entryPath = `${path}/${dirEntry.name}`
      if (dirEntry.isDirectory) {
        await traverseDirectory(entryPath)
      } else if (entryPath.endsWith(".md")) {
        const fileName = dirEntry.name as `${string}.md`
        const fileNameWithoutExtension = fileName.slice(0, -3)
        const filePath = `${path}/${fileName}` satisfies `${string}.md`
        const fileText = await Deno.readTextFile(filePath)
        const slug = slugifyFileName(fileNameWithoutExtension)
        // if (!isCriteriaMet({ filePath, fileText })) continue
        markdownFiles.set(slug, {
          fileName,
          fileNameWithoutExtension,
          filePath,
          fileText,
        })
      }
    }
  }
  await traverseDirectory(directoryPath)
  return markdownFiles
}

export async function getImageFiles(
  directoryPath: string
): Promise<Set<string>> {
  const filePaths = await getMarkdownFilePaths(directoryPath)
  const imageFiles = new Set<string>()
  for (const filePath of filePaths) {
    const fileText = await Deno.readTextFile(filePath)
    const wikilinkRegex = /\[\[(.+?)\]\]/g
    let match
    while ((match = wikilinkRegex.exec(fileText)) !== null) {
      imageFiles.add(match[1])
    }
  }
  return imageFiles
}
