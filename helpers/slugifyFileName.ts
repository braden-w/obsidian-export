import { Slug } from "../types.d.ts"

export const slugifyFileName = (fileName: string): Slug =>
  fileName
    .trim()
    .replace(/[\s-—]+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase()
