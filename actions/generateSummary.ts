/**
 * Write a Deno typescript function that opens the past 7 days' markdown files inside the "journals" folder and writes a summary to a file called "Today's note". They are markdown files whose names are in the YYYY-MM-DD format—e.g. "2022-01-20". For each of these files, match all of their wikilinks (enclosed in square [[ ]] brackets), and get their content from markdownFiles (you'll need to slugify the wikilink context first and then fetch the content from markdownFiles). If the content has the string "status: DONE", then append it to the summary file in the form `[${original wikilink title}](${slugified wikilink})`
 */
import { writeTextFile } from "../bridge/denoBridge.ts"
import { BASE_URL, N_DAYS } from "../constants.ts"
import {
  SlugToSummaryMap,
  getSlugToSummaryMap,
} from "../helpers/collection/slugToSummaryMap.ts"
import { isCriteriaMet } from "../helpers/markdown/isCriteriaMet.ts"
import { getArticleFrontmatter } from "../helpers/markdown/frontmatter.ts"
import { removeFileExtension } from "../helpers/markdown/removeFileExtension.ts"
import { slugifyFileName } from "../helpers/markdown/slugifyFileName.ts"
import { contentDirectory } from "../mod.ts"
import { MarkdownFileSummary } from "../types.d.ts"

async function main() {
  const summaries = await generateSummary()
  const sectionTitles = [
    "Noteworthy",
    "Media",
    "Reflections",
    "Everything Else",
  ] as const
  const sections = new Map<
    (typeof sectionTitles)[number],
    MarkdownFileSummary[]
  >(sectionTitles.map((title) => [title, []]))

  for (const summary of summaries) {
    const { data, error } = getArticleFrontmatter(summary)
    if (error) continue
    const { resonance, tags } = data
    const reflectionsTags = ["Reflection", "Thought"]
    const mediaTags = ["Tweet", "Video", "Image", "Article"]

    if (!resonance) continue
    if (resonance > 80) {
      sections.get("Noteworthy")!.push(summary)
    }
    if (tags?.some((tag) => reflectionsTags.includes(tag))) {
      sections.get("Reflections")!.push(summary)
    } else if (tags?.some((tag) => mediaTags.includes(tag))) {
      sections.get("Media")!.push(summary)
    } else {
      sections.get("Everything Else")!.push(summary)
    }
  }

  const sortedSections = new Map(
    Array.from(sections.entries()).map(([sectionName, summaries]) => [
      sectionName,
      summaries.sort((a, b) => {
        const dataA = getArticleFrontmatter(a).data
        const dataB = getArticleFrontmatter(b).data
        return (dataB?.resonance ?? 0) - (dataA?.resonance ?? 0)
      }),
    ])
  )

  const output = Array.from(sortedSections.entries())
    .map(([key, sectionSummaries]) => {
      return `# ${key}\n${sectionSummaries.map(createSummaryLink).join("\n")}\n`
    })
    .join("")
  // Create a file name in the form `Summary of Posts from ${7 days ago} to ${today}.md`
  const today = new Date()
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  } satisfies Intl.DateTimeFormatOptions
  const todayFormatted = today.toLocaleDateString("en-US", options)
  const fileName = `Musings—Stuff that Came Up On ${todayFormatted}.md`
  await writeTextFile(`${contentDirectory}/summaries/${fileName}`, output)
}

function createSummaryLink({ fileName, slug }: MarkdownFileSummary): string {
  const fileNameWithoutExtension = removeFileExtension(fileName)
  return `- [${fileNameWithoutExtension}](${BASE_URL}/${slug})`
}

main()

async function generateSummary() {
  const markdownFiles = await getSlugToSummaryMap()

  const markdownFileSummariesInRange: MarkdownFileSummary[] = Array.from(
    markdownFiles
  )
    .map(([_slug, markdownFileSummary]) => {
      if (!isCriteriaMet(markdownFileSummary)) return null
      const { data, error } = getArticleFrontmatter(markdownFileSummary)
      if (error) return null
      const { date, "date modified": dateModified } = data
      if (isDailyNoteWithinLastNDays(markdownFileSummary, N_DAYS)) {
        return extractNotesFromDailyNote(markdownFileSummary, markdownFiles)
      } else if (date && isWithinLastNDays(date, N_DAYS)) {
        return markdownFileSummary
      } else if (dateModified && isWithinLastNDays(dateModified, N_DAYS)) {
        return markdownFileSummary
      }

      return null
    })
    .filter((data): data is MarkdownFileSummary => data !== null)
  return markdownFileSummariesInRange
}

/**
 * Checks if a given name represents a date that is within the past 7 days.
 * The name should be in the format 'YYYY-MM-DD'.
 *
 * @param {string} dateString - A string in YYYY-MM-DD format
 * @returns {boolean} - `true` if the date is within the past 7 days, `false` otherwise.
 */

function isWithinLastNDays(date: Date, numberOfDays: number): boolean {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const msIn7Days = numberOfDays * 24 * 60 * 60 * 1000
  return diffInMs <= msIn7Days
}

async function appendToFile(filePath: string, fileText: string) {
  await writeTextFile(filePath, fileText, { append: true })
}

function extractNotesFromDailyNote(
  { fileText }: MarkdownFileSummary,
  markdownFiles: SlugToSummaryMap
) {
  const wikilinkRegex = /\[\[(.+?)\]\]/g
  return Array.from(fileText.matchAll(wikilinkRegex), (match) => {
    const originalWikilinkTitle = match[1]
    const wikilinkSlug = slugifyFileName(originalWikilinkTitle)
    const linkedFileData = markdownFiles.get(wikilinkSlug)

    return linkedFileData
  }).filter(Boolean)
}

function isDailyNoteWithinLastNDays(
  markdownFileSummary: MarkdownFileSummary,
  numberOfDays: number
) {
  const { fileName } = markdownFileSummary
  const fileNameWithoutExtension = removeFileExtension(fileName)
  // If the file name is in the format YYYY-MM-DD, then it's a daily note
  if (!fileNameWithoutExtension.match(/^\d{4}-\d{2}-\d{2}$/)) return false
  // Convert fileNameWithoutExtension to a Date object
  const dateFileName = new Date(fileNameWithoutExtension)
  return isWithinLastNDays(dateFileName, numberOfDays)
}
