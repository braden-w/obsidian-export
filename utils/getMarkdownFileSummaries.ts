import type { ProcessFileFn } from './file/applyToFilesRecursive.ts';
import { applyToFilesRecursive } from './file/applyToFilesRecursive.ts';
import { generateMarkdownFileSummary } from './markdown/generateMarkdownFileSummary.ts';
import type { MarkdownFileSummary } from './types.d.ts';

/** Returns a array of MarkdownFileSummary objects. */
export async function getMarkdownFileSummaries(
	contentDirectory: string
): Promise<MarkdownFileSummary[]> {
	const markdownFileSummaries: MarkdownFileSummary[] = [];

	const processFileEntry: ProcessFileFn = async ({ dirPath, fileName }) => {
		if (!fileName.endsWith('.md')) return;
		const markdownSummary = await generateMarkdownFileSummary({
			dirPath: dirPath as `${string}/${string}`,
			fileName: fileName as `${string}.md`
		});
		markdownFileSummaries.push(markdownSummary);
	};

	await applyToFilesRecursive({
		dirPath: contentDirectory,
		processFileFn: processFileEntry
	});
	return markdownFileSummaries;
}
