/**
 * Write a Deno typescript function that opens the past 7 days' markdown files inside the "journals" folder and writes a summary to a file called "Today's note". They are markdown files whose names are in the YYYY-MM-DD format—e.g. "2022-01-20". For each of these files, match all of their wikilinks (enclosed in square [[ ]] brackets), and get their content from markdownFiles (you'll need to slugify the wikilink context first and then fetch the content from markdownFiles). If the content has the string "status: DONE", then append it to the summary file in the form `[${original wikilink title}](${slugified wikilink})`
 */

import { getMarkdownFileSummaries } from "../helpers/fileUtils.ts"
import { isCriteriaMet } from "../helpers/isCriteriaMet.ts"
import { slugifyFileName } from "../helpers/slugifyFileName.ts"
import { contentDirectory } from "../mod.ts"

export async function generateSummary() {
  const markdownFiles = await getMarkdownFileSummaries(contentDirectory)
  const summaryFilePath =
    "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian/journals/summary.md"

  function isDateInRange(dateString: string): boolean {
    const fileDate = new Date(dateString)
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    return fileDate >= sevenDaysAgo && fileDate <= today
  }

  async function appendToFile(filePath: string, fileText: string) {
    await Deno.writeTextFile(filePath, fileText, { append: true })
  }

  for (const [slug, fileData] of markdownFiles.entries()) {
    const fileNameDate = fileData.filePath.split("/").pop().slice(0, -3)
    if (isDateInRange(fileNameDate)) {
      const wikilinkRegex = /\[\[(.+?)\]\]/g
      let match
      while ((match = wikilinkRegex.exec(fileData.fileText)) !== null) {
        const originalWikilinkTitle = match[1]
        const wikilinkSlug = slugifyFileName(originalWikilinkTitle)
        const linkedFileData = markdownFiles.get(wikilinkSlug)
        if (linkedFileData) {
          if (!isCriteriaMet(linkedFileData)) continue
          const summaryLine = `[${originalWikilinkTitle}](${wikilinkSlug})\n`
          await appendToFile(summaryFilePath, summaryLine)
        }
      }
    }
  }
}

generateSummary()
