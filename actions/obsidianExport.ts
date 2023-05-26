import {
  writeTextFile,
  copyFile,
  mkdir,
  readDir,
} from "../bridge/denoBridge.ts"
import {
  getReferencedImageFiles,
  getMarkdownFileSlugs,
} from "../helpers/collection/derivedSets.ts"
import {
  ProcessFileFn,
  applyToFilesRecursive,
} from "../helpers/file/applyToFilesRecursive.ts"
import { isCriteriaMet } from "../helpers/markdown/isCriteriaMet.ts"
import { generateMarkdownFileSummary } from "../helpers/markdown/generateMarkdownFileSummary.ts"
import { processText } from "../helpers/markdown/processText.ts"
import { MarkdownFileSummary } from "../types.d.ts"

export function obsidianExport({
  inputDir,
  outputDir,
  markdownFileSummaries,
}: {
  inputDir: string
  outputDir: string
  markdownFileSummaries: MarkdownFileSummary[]
}) {
  const markdownFileSlugs = getMarkdownFileSlugs({ markdownFileSummaries })

  const processFileEntry: ProcessFileFn = async ({ dirPath, fileName }) => {
    if (!fileName.endsWith(".md")) return
    const markdownSummary = await generateMarkdownFileSummary({
      dirPath: dirPath as `${string}/${string}`,
      fileName: fileName as `${string}.md`,
    })
    if (!isCriteriaMet(markdownSummary)) return
    const processedText = processText(markdownSummary, markdownFileSlugs)
    const { slug } = markdownSummary
    await writeTextFile(`${outputDir}/${slug}.md`, processedText)
  }

  applyToFilesRecursive({ dirPath: inputDir, processFileFn: processFileEntry })
}

export async function copyDirectory({
  inputDir,
  outputDir,
  markdownFileSummaries,
  allImageFiles = null,
}: {
  inputDir: string
  outputDir: string
  markdownFileSummaries: MarkdownFileSummary[]
  allImageFiles?: Set<string> | null
}) {
  if (allImageFiles === null)
    allImageFiles = getReferencedImageFiles({ markdownFileSummaries })
  const inputFiles = readDir(inputDir)

  for await (const file of inputFiles) {
    const src = `${inputDir}/${file.name}`
    const dest = `${outputDir}/${file.name.replace(/ /g, "-")}`

    if (file.isFile && allImageFiles.has(file.name)) {
      await copyFile(src, dest)
    } else if (file.isDirectory) {
      await mkdir(dest)
      await copyDirectory({
        inputDir: src,
        outputDir: dest,
        markdownFileSummaries,
        allImageFiles,
      })
    }
  }
}
