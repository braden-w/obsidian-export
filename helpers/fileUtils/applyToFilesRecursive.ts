export async function applyToFilesRecursive(
  dirPath: string,
  processFileFn: (filePath: string, fileName: string) => Promise<void>
) {
  for await (const dirEntry of Deno.readDir(dirPath)) {
    const entryPath = `${dirPath}/${dirEntry.name}` as const
    if (dirEntry.isDirectory) {
      await applyToFilesRecursive(entryPath, processFileFn)
    } else {
      await processFileFn(entryPath, dirEntry.name)
    }
  }
}
