export type Slug = string

export type MarkdownFileSummary = {
  slug: Slug
  fileName: `${string}.md`
  dirPath: string
  fileText: string
}
