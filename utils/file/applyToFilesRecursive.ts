import { readDir } from './fileUtils.ts';

export type ProcessFileFn = ({
	dirPath,
	fileName
}: {
	dirPath: string;
	fileName: string;
}) => Promise<void>;

/** Applies a function to each file in a directory, recursively. */
export async function applyToFilesRecursive({
	dirPath,
	processFileFn
}: {
	dirPath: string;
	processFileFn: ProcessFileFn;
}) {
	for await (const entry of readDir(dirPath)) {
		if (isEntryHidden(entry)) continue;
		if (entry.isDirectory) {
			await applyToFilesRecursive({
				dirPath: `${dirPath}/${entry.name}`,
				processFileFn
			});
		} else {
			await processFileFn({ dirPath, fileName: entry.name });
		}
	}
}

const isEntryHidden = (entry: Deno.DirEntry) => entry.name.startsWith('.');
