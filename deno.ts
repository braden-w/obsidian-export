import * as fs from "https://deno.land/std@0.148.0/node/fs.ts"

const contentDirectory = "/Users/braden/Code/obsidian/"
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
  const files = await fs.readdir(contentDirectory, )
  for (const file of files) {
    if (!file.endsWith(".md")) continue
    const text = await fs.readFile(`${contentDirectory}${file}`, "utf-8")
    const processedText = processText(text)
    await fs.writeFile(`${outputDirectory}/${file}`, processedText, "utf-8")
  }
})().catch((error) => console.error(error))
