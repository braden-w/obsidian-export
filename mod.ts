import { obsidianExport, copyDirectory } from "./actions/obsidianExport.ts"

export const contentDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/obsidian"
const contentOutputDirectory = "/Users/braden/Code/optim/apps/blog-sveltekit/src/content/articles"
const assetsDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/obsidian/assets"
const assetsOutputDirectory = "/Users/braden/Code/optim/apps/blog-sveltekit/public/assets"

await obsidianExport(contentDirectory, contentOutputDirectory)
await copyDirectory(assetsDirectory, assetsOutputDirectory)
