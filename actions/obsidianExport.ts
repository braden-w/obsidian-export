import { getImageFiles, getMarkdownFileSlugs } from "../helpers/fileUtils.ts"
import { applyToFilesRecursive } from "../helpers/fileUtils/applyToFilesRecursive.ts"
import { isCriteriaMet } from "../helpers/isCriteriaMet.ts"
import { getMarkdownFileSummary } from "../helpers/markdownUtils.ts"
import { processText } from "../helpers/processText.ts"

export async function obsidianExport(inputDir: string, outputDir: string) {
  const allMarkdownSlugifiedFiles = await getMarkdownFileSlugs()

  async function processFileEntry(entryPath: string, entryName: string) {
    if (!entryPath.endsWith(".md")) return
    const markdownSummary = await getMarkdownFileSummary(
      entryPath as `${string}/${string}.md`,
      entryName
    )
    if (!isCriteriaMet(markdownSummary)) return
    const { slug, fileText, fileNameWithoutExtension } = markdownSummary
    const processedText = processText(
      fileText,
      fileNameWithoutExtension,
      allMarkdownSlugifiedFiles
    )
    await Deno.writeTextFile(`${outputDir}/${slug}.md`, processedText)
  }

  applyToFilesRecursive(inputDir, processFileEntry)
}

export async function copyDirectory(
  inputDir: string,
  outputDir: string,
  allImageFiles: Set<string> | null = null
) {
  if (allImageFiles === null) allImageFiles = await getImageFiles()
  const inputFiles = await Deno.readDir(inputDir)

  for await (const file of inputFiles) {
    const src = `${inputDir}/${file.name}`
    const dest = `${outputDir}/${file.name.replace(/ /g, "-")}`

    if (file.isFile && allImageFiles.has(file.name)) {
      await Deno.copyFile(src, dest)
    } else if (file.isDirectory) {
      await Deno.mkdir(dest)
      await copyDirectory(src, dest, allImageFiles)
    }
  }
}
