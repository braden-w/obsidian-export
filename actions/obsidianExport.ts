import { getImageFiles, getMarkdownFileSlugs } from "../helpers/fileUtils.ts"
import {
  ProcessFileFn,
  applyToFilesRecursive,
} from "../helpers/fileUtils/applyToFilesRecursive.ts"
import { isCriteriaMet } from "../helpers/isCriteriaMet.ts"
import {
  generateMarkdownFileSummary,
  removeFileExtension,
} from "../helpers/markdownUtils.ts"
import { processText } from "../helpers/processText.ts"

export async function obsidianExport(inputDir: string, outputDir: string) {
  const allMarkdownSlugifiedFiles = await getMarkdownFileSlugs()

  const processFileEntry: ProcessFileFn = async ({ dirPath, fileName }) => {
    if (!fileName.endsWith(".md")) return
    const entryPath = `${dirPath}/${fileName}` as `${string}/${string}.md`
    const markdownSummary = await generateMarkdownFileSummary({
      entryPath,
      fileName: fileName as `${string}.md`,
    })
    if (!isCriteriaMet(markdownSummary)) return
    const { slug, fileText, fileName: mdFileName } = markdownSummary
    const fileNameWithoutExtension = removeFileExtension(mdFileName)
    const processedText = processText({
      text: fileText,
      title: fileNameWithoutExtension,
      allMarkdownSlugifiedFiles,
    })
    await Deno.writeTextFile(`${outputDir}/${slug}.md`, processedText)
  }

  applyToFilesRecursive({ dirPath: inputDir, processFileFn: processFileEntry })
}

export async function copyDirectory(
  inputDir: string,
  outputDir: string,
  allImageFiles: Set<string> | null = null
) {
  if (allImageFiles === null) allImageFiles = await getImageFiles()
  const inputFiles = await Deno.readDir(inputDir)

  for await (const file of inputFiles) {
    const src = `${inputDir}/${file.name}`
    const dest = `${outputDir}/${file.name.replace(/ /g, "-")}`

    if (file.isFile && allImageFiles.has(file.name)) {
      await Deno.copyFile(src, dest)
    } else if (file.isDirectory) {
      await Deno.mkdir(dest)
      await copyDirectory(src, dest, allImageFiles)
    }
  }
}
