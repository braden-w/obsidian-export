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

;(async () => {
  for await (const file of Deno.readDir(contentDirectory)) {
    if (!file.name.endsWith(".md")) continue
    console.log("🚀 ~ file: deno.ts:24 ~ forawait ~ file", file)
    const text = await Deno.readTextFile(`${contentDirectory}${file}`)
    console.log("🚀 ~ file: deno.ts:26 ~ forawait ~ text", text)
    const processedText = processText(text)
    await fs.writeFile(`${outputDirectory}/${file}`, processedText, "utf-8")
  }
})().catch((error) => console.error(error))
