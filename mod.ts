import { generateDailyActivitySummary } from "./actions/generateSummary.ts"
import {
  copyReferencedImageFiles,
  obsidianExport,
} from "./actions/obsidianExport.ts"
import { getReferencedImageFiles } from "./helpers/collection/derivedSets.ts"
import { getMarkdownFileSummaries } from "./helpers/collection/getMarkdownFileSummaries.ts"

export const contentDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/obsidian"
const contentOutputDirectory =
  "/Users/braden/Code/optim/apps/blog-sveltekit/src/content/articles"
const assetsDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/obsidian/assets"
const assetsOutputDirectory =
  "/Users/braden/Code/optim/apps/blog-sveltekit/public/assets"

const markdownFileSummaries = await getMarkdownFileSummaries(contentDirectory)
obsidianExport({
  inputDir: contentDirectory,
  outputDir: contentOutputDirectory,
  markdownFileSummaries,
})
const referencedImageFiles = getReferencedImageFiles({ markdownFileSummaries })
copyReferencedImageFiles({
  inputDir: assetsDirectory,
  outputDir: assetsOutputDirectory,
  referencedImageFiles,
})
