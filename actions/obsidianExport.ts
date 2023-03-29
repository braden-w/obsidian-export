import { getMarkdownFileSlugs } from "../helpers/fileUtils.ts"
import { isCriteriaMet } from "../helpers/isCriteriaMet.ts"
import { getMarkdownFileSummary } from "../helpers/markdownUtils.ts"
import { processText } from "../helpers/processText.ts"

export async function obsidianExport(inputDir: string, outputDir: string) {
  const allMarkdownSlugifiedFiles = await getMarkdownFileSlugs()

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
  }

  traverseDirectory(inputDir)
}
