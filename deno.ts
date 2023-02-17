const contentDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian"
const contentOutputDirectory = "/Users/braden/Code/optim/src/content/articles"
const assetsDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian/assets"
const assetsOutputDirectory = "/Users/braden/Code/optim/public"

const slugifyFileName = (fileName: string) =>
  fileName
    .trim()
    .replace(/[\s-—]+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase()

function wikilinksToLinks(stringWithWikilinks: string): string {
  const wikilinkRegex = /\[\[(.+?)\]\]/g
  return stringWithWikilinks.replace(wikilinkRegex, (s: string) => {
    if (!s) return ""
    // If the wikilink has a pipe, use the text after the pipe as the link text
    // e.g. [[Some Page|Some Text]] -> [Some Text](some-page)
    if (s.includes("|")) {
      const match = s.match(/\[\[(.+?)\|(.+?)\]\]/)
      if (match) {
        const page = match[1]
        const text = match[2]
        return `[${text}](${slugifyFileName(page)})`
      }
    }
    // Otherwise, use the page name as the link text
    const match = s.match(/\[\[(.+?)\]\]/)
    if (match) {
      const page = match[1]
      return `[${page}](${slugifyFileName(page)})`
    }
    return ""
  })
}

function embedLinksToLinks(stringWithEmbedLinks: string): string {
  const embedLinkRegex = /!\[\[(.+?)\]\]/g
  return stringWithEmbedLinks.replace(embedLinkRegex, (s: string) => {
    if (!s) return ""
    const match = s.match(/!\[\[(.+?)\]\]/)
    if (match) {
      const embeddedImageName = match[1]
      return `![${embeddedImageName}](/assets/${embeddedImageName})`
    }
    return ""
  })
}

// Function that adds `title: ${title}` to the second line of the string
function addTitleToSecondLine(inputString: string, title: string): string {
  const lines = inputString.split("\n")
  lines.splice(1, 0, `title: ${title}`)
  return lines.join("\n")
}

const processText = (text: string, title: string) =>
  addTitleToSecondLine(wikilinksToLinks(embedLinksToLinks(text)), title)

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
  return filePath.includes("Content/") && fileText.includes("")
}
