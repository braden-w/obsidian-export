import { getImageFiles } from "../helpers/fileUtils.ts"

export async function copyDirectory(
  inputDir: string,
  outputDir: string,
  allImageFiles: Set<string> | null = null
) {
  if (allImageFiles === null) allImageFiles = await getImageFiles(inputDir)
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
