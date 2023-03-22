import { slugifyFileName, isCriteriaMet } from "./helpers.ts"

export async function getMarkdownFiles(
  directoryPath: string
): Promise<Set<string>> {
  const markdownFiles = new Set<string>()
  for await (const dirEntry of Deno.readDir(directoryPath)) {
    const path = `${directoryPath}/${dirEntry.name}`
    if (dirEntry.isDirectory) {
      const subDirectoryMarkdownFiles = await getMarkdownFiles(path)
      subDirectoryMarkdownFiles.forEach((markdownFile) => {
        markdownFiles.add(`${slugifyFileName(markdownFile)}`)
      })
    } else if (path.endsWith(".md")) {
      const filePath = `${directoryPath}/${dirEntry.name}` as `${string}.md`
      const fileText = await Deno.readTextFile(filePath)
      if (!isCriteriaMet({ filePath, fileText })) continue
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
      const filePath = `${directoryPath}/${dirEntry.name}` as `${string}.md`
      const fileText = await Deno.readTextFile(filePath)
      if (!isCriteriaMet({ filePath, fileText })) continue
      markdownFiles.add(filePath)
    }
  }
  return markdownFiles
}

export async function getImageFiles(
  directoryPath: string
): Promise<Set<string>> {
  const filePaths = await getMarkdownFilePaths(directoryPath)
  const imageFiles = new Set<string>()
  for (const filePath of filePaths) {
    const content = await Deno.readTextFile(filePath)
    const wikilinkRegex = /\[\[(.+?)\]\]/g
    let match
    while ((match = wikilinkRegex.exec(content)) !== null) {
      imageFiles.add(match[1])
    }
  }
  return imageFiles
}
