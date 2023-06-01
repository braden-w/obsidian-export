import type { ProcessFileFn } from './file/applyToFilesRecursive.ts';
import { applyToFilesRecursive } from './file/applyToFilesRecursive.ts';
import { generateMarkdownFileSummary } from './markdown/generateMarkdownFileSummary.ts';
import type { MarkdownFileSummary } from './types.d.ts';

/** Returns a array of MarkdownFileSummary objects. */
export async function getMarkdownFileSummaries(
	contentDirectory: string
): Promise<MarkdownFileSummary[]> {
	const markdownFileSummaries: MarkdownFileSummary[] = [];

	const processFileEntry: ProcessFileFn = async ({ path }) => {
		if (!path.endsWith('.md')) return;
		const markdownSummary = await generateMarkdownFileSummary({
			path: path as `${string}.md`
		});
		markdownFileSummaries.push(markdownSummary);
	};

	await applyToFilesRecursive({
		dirPath: contentDirectory,
		processFileFn: processFileEntry
	});
	return markdownFileSummaries;
}
