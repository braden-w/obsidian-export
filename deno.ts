const contentDirectory =
  "/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian"
const outputDirectory = "/Users/braden/Code/optim/src/content/articles"

const slugifyFileName = (fileName: `${string}.md`) =>
  fileName
    .replaceAll(" ", "-")
    .replaceAll("—", "-")
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
        const page = match[1] as `{string}.md`
        const text = match[2]
        return `[${text}](${slugifyFileName(page)})`
      }
    }
    // Otherwise, use the page name as the link text
    const match = s.match(/\[\[(.+?)\]\]/)
    if (match) {
      const page = match[1] as `{string}.md`
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

const processText = (text: string) => wikilinksToLinks(embedLinksToLinks(text))

async function readFiles(dir: string) {
  for await (const dirEntry of Deno.readDir(dir)) {
    if (dirEntry.isDirectory) {
      await readFiles(`${dir}/${dirEntry.name}`)
      continue
    }
    if (
      !dirEntry.name.endsWith(".md") ||
      dirEntry.name.includes("?") ||
      dirEntry.name.includes("%")
    )
      continue

    // Now we know it's a markdown file
    const fileName = dirEntry.name as `${string}.md`
    const filePath = `${dir}/${fileName}` as `${string}/${string}.md`
    const fileText = await Deno.readTextFile(filePath)
    if (!isCriteriaMet({ filePath, fileText })) continue
    const processedText = processText(fileText)
    const slugifiedFileName = slugifyFileName(fileName)
    await Deno.writeTextFile(
      `${outputDirectory}/${slugifiedFileName}`,
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
