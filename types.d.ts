export type Slug = string

export type MarkdownFileSummary = {
  slug: Slug
  fileName: `${string}.md`
  filePath: `${string}/${string}.md`
  fileText: string
}
