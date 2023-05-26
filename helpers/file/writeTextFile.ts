export async function writeTextFile(
  filePath: string,
  fileText: string,
  options: { append?: boolean } = {}
) {
  return await Deno.writeTextFile(filePath, fileText, options)
}
