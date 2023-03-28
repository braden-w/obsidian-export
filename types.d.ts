export type Slug = string

export type MarkdownFileSummary = {
  slug: Slug
  fileName: `${string}.md`
  fileNameWithoutExtension: string
  filePath: `${string}.md`
  fileText: string
}
