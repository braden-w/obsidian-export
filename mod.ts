import { getMarkdownFiles, getImageFiles } from "./helpers/getFiles.ts"
import { isCriteriaMet, slugifyFileName } from "./helpers/helpers.ts"
import { processText } from "./helpers/processText.ts"

const contentDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian"
const contentOutputDirectory = "/Users/braden/Code/optim/src/content/articles"
const assetsDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian/assets"
const assetsOutputDirectory = "/Users/braden/Code/optim/public/assets"

await obsidianExport(contentDirectory, contentOutputDirectory)
await copyDirectory(assetsDirectory, assetsOutputDirectory)
// console.log(await getMarkdownFiles(contentDirectory))

async function obsidianExport(
  inputDir: string,
  outputDir: string,
  allMarkdownSlugifiedFiles: Set<string> | null = null
) {
  if (allMarkdownSlugifiedFiles === null)
    allMarkdownSlugifiedFiles = await getMarkdownFiles(contentDirectory)

  for await (const dirEntry of Deno.readDir(inputDir)) {
    if (dirEntry.isDirectory) {
      await obsidianExport(
        `${inputDir}/${dirEntry.name}`,
        outputDir,
        allMarkdownSlugifiedFiles
      )
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
    const dest = `${outputDir}/${file.name.replace(/ /g, "-")}`

    if (file.isFile && allImageFiles.has(file.name)) {
      await Deno.copyFile(src, dest)
    } else if (file.isDirectory) {
      await Deno.mkdir(dest)
      await copyDirectory(src, dest)
    }
  }
}
