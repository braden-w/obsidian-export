import { processText, slugifyFileName } from "./helpers.ts"

const contentDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian"
const contentOutputDirectory = "/Users/braden/Code/optim/src/content/articles"
const assetsDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian/assets"
const assetsOutputDirectory = "/Users/braden/Code/optim/public/assets"

async function readFiles(inputDir: string, outputDir: string) {
  for await (const dirEntry of Deno.readDir(inputDir)) {
    if (dirEntry.isDirectory) {
      await readFiles(`${inputDir}/${dirEntry.name}`, outputDir)
      continue
    }
    if (!dirEntry.name.endsWith(".md")) continue

    // Now we know it's a markdown file
    const fileName = dirEntry.name as `${string}.md`
    const filePath = `${inputDir}/${fileName}` as const
    const fileText = await Deno.readTextFile(filePath)

    if (!isCriteriaMet({ filePath, fileText })) continue

    const processedText = processText(fileText, fileName.slice(0, -3))
    const slugifiedFileName = `${slugifyFileName(fileName.slice(0, -3))}.md`
    await Deno.writeTextFile(`${outputDir}/${slugifiedFileName}`, processedText)
  }
}

async function copyDirectory(inputDir: string, outputDir: string) {
  const inputFiles = await Deno.readDir(inputDir)

  for await (const file of inputFiles) {
    const src = `${inputDir}/${file.name}`
    const dest = `${outputDir}/${file.name}`

    if (file.isFile) {
      await Deno.copyFile(src, dest)
    } else if (file.isDirectory) {
      await Deno.mkdir(dest)
      await copyDirectory(src, dest)
    }
  }
}

await readFiles(contentDirectory, contentOutputDirectory)
await copyDirectory(assetsDirectory, assetsOutputDirectory)

function isCriteriaMet({
  filePath,
  fileText,
}: {
  filePath: `${string}.md`
  fileText: string
}) {
  return fileText.includes("status: DONE")
}
