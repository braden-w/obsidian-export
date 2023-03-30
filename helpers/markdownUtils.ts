import { MarkdownFileSummary, Slug } from "../types.d.ts"
import { z } from "https://deno.land/x/zod/mod.ts"

export const articleSchema = z.object({
  title: z.string().optional(),
  alias: z.string().nullable(),
  tags: z
    .string()
    .nullable()
    .transform((tags) => tags?.split(",").map((tag) => tag.trim())),
  resonance: z.number().nullable(),
  subtitle: z.string().nullable(),
  date: z.date(),
  "date modified": z.date().nullable(),
  "link-twitter": z.string().url().nullable(),
  "link-medium": z.string().url().nullable(),
  "link-substack": z.string().url().nullable(),
  "link-reddit": z.string().url().nullable(),
  "link-github": z.string().url().nullable(),
})

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
