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
  const textEmbedsFixed = replaceWikiEmbedMdEmbed(text)
  const textLinksFixed = replaceWikiLinksMdLinks({
    stringWithWikilinks: textEmbedsFixed,
    allMarkdownSlugifiedFiles,
  })
  const textWithTitleFrontmatter = addTitleToSecondLine({
    text: textLinksFixed,
    title,
  })
  return textWithTitleFrontmatter
}

/** Function that replaces `[[Some Page]]` with `[Some Page](/articles/some-page)` */
function replaceWikiLinksMdLinks({
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

/** Function that replaces `![[Some Image]]` with `![Some Image](/assets/some-image)` */
function replaceWikiEmbedMdEmbed(text: string): string {
  const embedLinkRegex = /!\[\[(.+?)\]\]/g
  return text.replace(embedLinkRegex, (s: string) => {
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
  text,
  title,
}: {
  text: string
  title: string
}): string {
  const lines = text.split("\n")
  lines.splice(1, 0, `title: ${title}`)
  return lines.join("\n")
}
