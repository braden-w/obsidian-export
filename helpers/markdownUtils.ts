import { MarkdownFileSummary, Slug } from "../types.d.ts"

export async function getMarkdownFileSummary(
  entryPath: `${string}/${string}.md`,
  entryName: string
): Promise<MarkdownFileSummary> {
  const fileName = entryName as `${string}.md`
  const fileNameWithoutExtension = removeFileExtension(fileName)
  const filePath = entryPath
  const fileText = await Deno.readTextFile(filePath)
  const slug = slugifyFileName(fileNameWithoutExtension)
  return {
    slug,
    fileName,
    fileNameWithoutExtension,
    filePath,
    fileText,
  }
}

export function removeFileExtension(
  fileName: MarkdownFileSummary["fileName"]
): MarkdownFileSummary["fileNameWithoutExtension"] {
  return fileName.slice(0, -3)
}

export const slugifyFileName = (
  fileName: MarkdownFileSummary["fileNameWithoutExtension"]
): Slug =>
  fileName
    .trim()
    .replace(/[\s-—]+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase()
