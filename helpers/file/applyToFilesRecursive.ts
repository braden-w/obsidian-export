export type ProcessFileFn = ({
  dirPath,
  fileName,
}: {
  dirPath: string
  fileName: string
}) => Promise<void>

/** Applies a function to each file in a directory, recursively. */
export async function applyToFilesRecursive({
  dirPath,
  processFileFn,
}: {
  dirPath: string
  processFileFn: ProcessFileFn
}) {
  for await (const dirEntry of Deno.readDir(dirPath)) {
    if (dirEntry.isDirectory) {
      await applyToFilesRecursive({
        dirPath: `${dirPath}/${dirEntry.name}`,
        processFileFn,
      })
    } else {
      await processFileFn({ dirPath, fileName: dirEntry.name })
    }
  }
}
