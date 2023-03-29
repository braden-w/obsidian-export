/**
 * Write a Deno typescript function that opens the past 7 days' markdown files inside the "journals" folder and writes a summary to a file called "Today's note". They are markdown files whose names are in the YYYY-MM-DD format—e.g. "2022-01-20". For each of these files, match all of their wikilinks (enclosed in square [[ ]] brackets), and get their content from markdownFiles (you'll need to slugify the wikilink context first and then fetch the content from markdownFiles). If the content has the string "status: DONE", then append it to the summary file in the form `[${original wikilink title}](${slugified wikilink})`
 */

import {
  getMarkdownFileSummaries,
  MarkdownFileSummaries,
} from "../helpers/fileUtils.ts"
import { slugifyFileName } from "../helpers/slugifyFileName.ts"
import { MarkdownFileSummary } from "../types.d.ts"

export async function generateSummary() {
  const markdownFiles = await getMarkdownFileSummaries()

  const markdownFileSummariesInRange: MarkdownFileSummary[] = Array.from(
    markdownFiles
  )
    .map(([_slug, markdownFileSummary]) => {
      const { fileNameWithoutExtension } = markdownFileSummary
      if (isFileNameWithinLastSevenDays(fileNameWithoutExtension)) {
        return extractNotesFromDailyNote(markdownFileSummary, markdownFiles)
      }
      return null
    })
    .filter((data): data is MarkdownFileSummary => data !== null)
  return markdownFileSummariesInRange
}

console.log(await generateSummary())

/**
 * Checks if a given name represents a date that is within the past 7 days.
 * The name should be in the format 'YYYY-MM-DD'.
 *
 * @param {string} dateString - A string in YYYY-MM-DD forat
 * @returns {boolean} - `true` if the date is within the past 7 days, `false` otherwise.
 */

function isWithinLastSevenDays( dateString: string): boolean {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMs = now.getTime() - date.getTime()
  const msIn7Days = 7 * 24 * 60 * 60 * 1000
  return diffInMs <= msIn7Days
}

async function appendToFile(filePath: string, fileText: string) {
  await Deno.writeTextFile(filePath, fileText, { append: true })
}

function extractNotesFromDailyNote(
  { fileText }: MarkdownFileSummary,
  markdownFiles: MarkdownFileSummaries
) {
  const wikilinkRegex = /\[\[(.+?)\]\]/g
  return Array.from(fileText.matchAll(wikilinkRegex), (match) => {
    const originalWikilinkTitle = match[1]
    const wikilinkSlug = slugifyFileName(originalWikilinkTitle)
    const linkedFileData = markdownFiles.get(wikilinkSlug)

    return linkedFileData
  }).filter(Boolean)
}
