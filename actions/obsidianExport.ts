import { getMarkdownFileSlugs } from "../helpers/fileUtils.ts"
import { isCriteriaMet } from "../helpers/isCriteriaMet.ts"
import { processText } from "../helpers/processText.ts"
import { slugifyFileName } from "../helpers/slugifyFileName.ts"

export async function obsidianExport(
  inputDir: string,
  outputDir: string,
  allMarkdownSlugifiedFiles?: Set<string>
) {
  if (!allMarkdownSlugifiedFiles)
    allMarkdownSlugifiedFiles = await getMarkdownFileSlugs()

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
    const fileNameWithoutExtension = fileName.slice(0, -3)
    const filePath = `${inputDir}/${fileName}` as const
    const fileText = await Deno.readTextFile(filePath)

    if (
      !isCriteriaMet({ fileName, fileNameWithoutExtension, filePath, fileText })
    )
      continue

    const processedText = processText(
      fileText,
      fileName.slice(0, -3),
      allMarkdownSlugifiedFiles
    )
    const slugifiedFileName = `${slugifyFileName(fileName.slice(0, -3))}.md`
    await Deno.writeTextFile(`${outputDir}/${slugifiedFileName}`, processedText)
  }
}
