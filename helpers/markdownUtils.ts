import { parse } from "https://deno.land/x/frontmatter/mod.ts"
import { z } from "https://deno.land/x/zod/mod.ts"

import { MarkdownFileSummary, Slug } from "../types.d.ts"

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

export async function generateMarkdownFileSummary({
  entryPath,
  entryName,
}: {
  entryPath: `${string}/${string}.md`
  entryName: string
}): Promise<MarkdownFileSummary> {
  const fileName = entryName as `${string}.md`
  const fileNameWithoutExtension = removeFileExtension(fileName)
  const filePath = entryPath
  const fileText = await Deno.readTextFile(filePath)
  const slug = slugifyFileName(fileNameWithoutExtension)
  return {
    slug,
    fileName,
    filePath,
    fileText,
  }
}

export function getArticleData({ fileText, fileName }: MarkdownFileSummary) {
  try {
    const { data } = parse(fileText)
    const dataParsed = articleSchema.parse(data)
    return { data: dataParsed }
  } catch (error) {
    return { error: { fileName, message: error.message } }
  }
}

export function removeFileExtension(
  fileName: MarkdownFileSummary["fileName"]
): string {
  return fileName.slice(0, -3)
}

export const slugifyFileName = (fileName: string): Slug =>
  fileName
    .trim()
    .replace(/[\s-—]+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase()
