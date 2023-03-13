import { processText, slugifyFileName } from "./helpers.ts"

const contentDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian"
const contentOutputDirectory = "/Users/braden/Code/optim/src/content/articles"
const assetsDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian/assets"
const assetsOutputDirectory = "/Users/braden/Code/optim/public/assets"

const allMarkdownSlugifiedFiles = await getMarkdownFiles(contentDirectory)
async function obsidianExport(inputDir: string, outputDir: string) {
  for await (const dirEntry of Deno.readDir(inputDir)) {
    if (dirEntry.isDirectory) {
      await obsidianExport(`${inputDir}/${dirEntry.name}`, outputDir)
      continue
    }
    if (!dirEntry.name.endsWith(".md")) continue

    // Now we know it's a markdown file
    const fileName = dirEntry.name as `${string}.md`
    const filePath = `${inputDir}/${fileName}` as const
    const fileText = await Deno.readTextFile(filePath)

    if (!isCriteriaMet({ filePath, fileText })) continue

    const processedText = processText(
      fileText,
      fileName.slice(0, -3),
      allMarkdownSlugifiedFiles
    )
    const slugifiedFileName = `${slugifyFileName(fileName.slice(0, -3))}.md`
    await Deno.writeTextFile(`${outputDir}/${slugifiedFileName}`, processedText)
  }
}

const allImageFiles = await getImageFiles(contentDirectory)
async function copyDirectory(inputDir: string, outputDir: string) {
  const inputFiles = await Deno.readDir(inputDir)

  for await (const file of inputFiles) {
    const src = `${inputDir}/${file.name}`
    const dest = `${outputDir}/${file.name}`

    if (file.isFile && allImageFiles.has(file.name)) {
      await Deno.copyFile(src, dest)
    } else if (file.isDirectory) {
      await Deno.mkdir(dest)
      await copyDirectory(src, dest)
    }
  }
}
async function getMarkdownFiles(directoryPath: string): Promise<Set<string>> {
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

async function getMarkdownFilePaths(
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

async function getImageFiles(directoryPath: string): Promise<Set<string>> {
  const filePaths = await getMarkdownFilePaths(directoryPath)
  const imageFiles = new Set<string>()
  for (const filePath of filePaths) {
    const content = await Deno.readTextFile(filePath)
    const wikilinkRegex = /\[\[(.+?)\]\]/g
    let match
    while ((match = wikilinkRegex.exec(content)) !== null) {
      imageFiles.add(decodeURIComponent(match[1]))
    }
  }
  return imageFiles
}

function isCriteriaMet({
  filePath,
  fileText,
}: {
  filePath: `${string}.md`
  fileText: string
}) {
  return fileText.includes("status: DONE")
}

await obsidianExport(contentDirectory, contentOutputDirectory)
await copyDirectory(assetsDirectory, assetsOutputDirectory)
// console.log(await getMarkdownFiles(contentDirectory))
