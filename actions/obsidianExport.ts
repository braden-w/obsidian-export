import { getMarkdownFiles } from "../helpers/fileUtils.ts"
import { isCriteriaMet } from "../helpers/isCriteriaMet.ts"
import { processText } from "../helpers/processText.ts"
import { slugifyFileName } from "../helpers/slugifyFileName.ts"

// console.log(await getMarkdownFiles(contentDirectory))
export async function obsidianExport(
  inputDir: string,
  outputDir: string,
  allMarkdownSlugifiedFiles: Set<string> | null = null
) {
  if (allMarkdownSlugifiedFiles === null)
    allMarkdownSlugifiedFiles = await getMarkdownFiles(inputDir)

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
