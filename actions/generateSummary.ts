/**
 * Write a Deno typescript function that opens the past 7 days' markdown files inside the "journals" folder and writes a summary to a file called "Today's note". They are markdown files whose names are in the YYYY-MM-DD format—e.g. "2022-01-20". For each of these files, match all of their wikilinks (enclosed in square [[ ]] brackets), and get their content from markdownFiles (you'll need to slugify the wikilink context first and then fetch the content from markdownFiles). If the content has the string "status: DONE", then append it to the summary file in the form `[${original wikilink title}](${slugified wikilink})`
 */

import { getMarkdownFileSummaries } from "../helpers/fileUtils.ts"
import { isCriteriaMet } from "../helpers/isCriteriaMet.ts"
import { slugifyFileName } from "../helpers/slugifyFileName.ts"
import { MarkdownFileSummary } from "../types.d.ts"

export async function generateSummary() {
  const markdownFiles = await getMarkdownFileSummaries()

  function isDateInRange(dateString: string): boolean {
    const fileDate = new Date(dateString)
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    return fileDate >= sevenDaysAgo && fileDate <= today
  }

  const markdownFileSummariesInRange: MarkdownFileSummary[] = Array.from(
    markdownFiles
  )
    .map(([_slug, { fileNameWithoutExtension, fileText }]) => {
      const fileNameDate = fileNameWithoutExtension
      if (isDateInRange(fileNameDate)) {
        const wikilinkRegex = /\[\[(.+?)\]\]/g
        let match
        while ((match = wikilinkRegex.exec(fileText)) !== null) {
          const originalWikilinkTitle = match[1]
          const wikilinkSlug = slugifyFileName(originalWikilinkTitle)
          const linkedFileData = markdownFiles.get(wikilinkSlug)
          if (linkedFileData) {
            return linkedFileData
          }
        }
      }
      return null
    })
    .filter((data): data is MarkdownFileSummary => data !== null)
  return markdownFileSummariesInRange
}

console.log(await generateSummary())

async function appendToFile(filePath: string, fileText: string) {
  await Deno.writeTextFile(filePath, fileText, { append: true })
}
