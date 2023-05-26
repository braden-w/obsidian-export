export async function applyToFilesRecursive({
  dirPath,
  processFileFn,
}: {
  dirPath: string
  processFileFn: (filePath: string, fileName: string) => Promise<void>
}) {
  for await (const dirEntry of Deno.readDir(dirPath)) {
    const entryPath = `${dirPath}/${dirEntry.name}` as const
    if (dirEntry.isDirectory) {
      await applyToFilesRecursive({ dirPath: entryPath, processFileFn })
    } else {
      await processFileFn(entryPath, dirEntry.name)
    }
  }
}
