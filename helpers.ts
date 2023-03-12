export const processText = (text: string, title: string) =>
  addTitleToSecondLine(
    wikilinksToLinks(
      prefaceMarkdownLinksWithAssetsFolder(embedLinksToLinks(text))
    ),
    title
  )

export const slugifyFileName = (fileName: string) =>
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

function prefaceMarkdownLinksWithAssetsFolder(
  stringWithMarkdownLinks: string
): string {
  const markdownLinkRegex = /!\[(.+?)\]\((.+?)\)/g
  return stringWithMarkdownLinks.replace(markdownLinkRegex, (s: string) => {
    if (!s) return ""
    const match = s.match(/\[(.+?)\]\((.+?)\)/)
    if (match) {
      const text = match[1]
      const link = match[2]
      return `![${text}](/assets/${link})`
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
