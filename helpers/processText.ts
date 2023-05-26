import { slugifyFileName } from "./markdownUtils.ts"

export function processText({
  text,
  title,
  allMarkdownSlugifiedFiles,
}: {
  text: string
  title: string
  allMarkdownSlugifiedFiles: Set<string>
}) {
  return addTitleToSecondLine({
    inputString: wikilinksToLinks({
      stringWithWikilinks: embedLinksToLinks(text),
      allMarkdownSlugifiedFiles,
    }),
    title,
  })
}

function wikilinksToLinks({
  stringWithWikilinks,
  allMarkdownSlugifiedFiles,
}: {
  stringWithWikilinks: string
  allMarkdownSlugifiedFiles: Set<string>
}): string {
  const wikilinkRegex = /\[\[(.+?)\]\]/g
  return stringWithWikilinks.replace(wikilinkRegex, (s: string) => {
    if (!s) return ""
    // If the wikilink has a pipe, use the text after the pipe as the link text
    // e.g. [[Some Page|Some Text]] -> [Some Text](some-page)
    if (s.includes("|")) {
      const match = s.match(/\[\[(.+?)\|(.+?)\]\]/)
      if (match) {
        const [_, page, alias] = match
        if (!allMarkdownSlugifiedFiles.has(slugifyFileName(page)))
          return `${alias}`
        return `[${alias}](/articles/${slugifyFileName(page)})`
      }
    }
    // Otherwise, use the page name as the link text
    const match = s.match(/\[\[(.+?)\]\]/)
    if (match) {
      const [_, page] = match
      // If slugifyFileName(page) in allMarkdownSlugifiedFiles, return the link
      if (!allMarkdownSlugifiedFiles.has(slugifyFileName(page)))
        return `${page}`
      return `[${page}](/articles/${slugifyFileName(page)})`
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
      const embeddedImageNameNoSpaces = embeddedImageName.replace(/ /g, "-")
      return `![${embeddedImageName}](/assets/${embeddedImageNameNoSpaces})`
    }
    return ""
  })
}

// Function that adds `title: ${title}` to the second line of the string
function addTitleToSecondLine({
  inputString,
  title,
}: {
  inputString: string
  title: string
}): string {
  const lines = inputString.split("\n")
  lines.splice(1, 0, `title: ${title}`)
  return lines.join("\n")
}
