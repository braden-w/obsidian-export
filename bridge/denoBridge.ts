export async function writeTextFile(
  filePath: string,
  fileText: string,
  options: { append?: boolean } = {}
) {
  return await Deno.writeTextFile(filePath, fileText, options)
}

export async function copyFile(fromPath: string, toPath: string) {
  return await Deno.copyFile(fromPath, toPath)
}

export async function mkdir(path: string) {
  return await Deno.mkdir(path)
}
