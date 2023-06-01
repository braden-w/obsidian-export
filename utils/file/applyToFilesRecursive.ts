import { readDir } from './fileUtils.ts';

export type ProcessFileFn = ({ path }: { path: string }) => Promise<void>;

/** Applies a function to each file in a directory, recursively. */
export async function applyToFilesRecursive({
	dirPath,
	processFileFn
}: {
	dirPath: string;
	processFileFn: ProcessFileFn;
}) {
	for await (const entry of readDir({ path: dirPath })) {
		if (isEntryHidden(entry)) continue;
		if (entry.isDirectory) {
			await applyToFilesRecursive({
				dirPath: `${dirPath}/${entry.name}`,
				processFileFn
			});
		} else {
			const path = `${dirPath}/${entry.name}`;
			await processFileFn({ path });
		}
	}
}

const isEntryHidden = (entry: Deno.DirEntry) => entry.name.startsWith('.');
