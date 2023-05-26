export type ProcessFileFn = ({
  filePath,
  fileName,
}: {
  filePath: string
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
    const entryPath = `${dirPath}/${dirEntry.name}` as const
    if (dirEntry.isDirectory) {
      await applyToFilesRecursive({ dirPath: entryPath, processFileFn })
    } else {
      await processFileFn({ filePath: entryPath, fileName: dirEntry.name })
    }
  }
}
