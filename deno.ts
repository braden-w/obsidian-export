import * as fs from "https://deno.land/std@0.148.0/node/fs.ts"

const contentDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian"
const outputDirectory = "/Users/braden/Code/optim/src/content/articles"

const slugify = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase()

const processText = (text: string) =>
  text.replace(/\[\[([^\]]+)\]\]/g, (_match, fileName) => {
    const slug = slugify(fileName)
    const filePath = `${contentDirectory}${fileName}`
    try {
      fs.accessSync(filePath)
      return `[${fileName}](${slug})`
    } catch {
      return `*${fileName}*`
    }
  })

async function readFiles(dir: string) {
  for await (const dirEntry of Deno.readDir(dir)) {
    if (dirEntry.isDirectory) {
      await readFiles(`${dir}/${dirEntry.name}`)
      continue
    }
    if (!dirEntry.name.endsWith(".md")) continue

    // Now we know it's a markdown file
    const filePath = `${dir}/${dirEntry.name}` as `${string}.md`
    const fileText = await Deno.readTextFile(filePath)
    if (!isCriteriaMet({ filePath, fileText })) continue
    const processedText = processText(fileText)
    await Deno.writeTextFile(
      `${outputDirectory}/${dirEntry.name}`,
      processedText
    )
  }
}

await readFiles(contentDirectory)

function isCriteriaMet({
  filePath,
  fileText,
}: {
  filePath: `${string}.md`
  fileText: string
}) {
  return filePath.includes("Content/") && fileText.includes("")
}
