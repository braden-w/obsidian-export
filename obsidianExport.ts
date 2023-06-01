import { applyToFilesRecursive, ProcessFileFn } from './utils/file/applyToFilesRecursive.ts';
import { copyFile, writeTextFile } from './utils/file/fileUtils.ts';
import { generateMarkdownFileSummary } from './utils/markdown/generateMarkdownFileSummary.ts';
import { isCriteriaMet } from './utils/markdown/isCriteriaMet.ts';
import { processText } from './utils/markdown/processText.ts';

export function obsidianExport({
	inputDir,
	outputDir,
	markdownFileSlugs
}: {
	inputDir: string;
	outputDir: string;
	markdownFileSlugs: Set<string>;
}) {
	const processFileEntry: ProcessFileFn = async ({ path }) => {
		if (!path.endsWith('.md')) return;
		const markdownSummary = await generateMarkdownFileSummary({
			path: path as `${string}.md`
		});
		if (!isCriteriaMet(markdownSummary)) return;
		const processedText = processText(markdownSummary, markdownFileSlugs);
		const { slug } = markdownSummary;
		await writeTextFile({ filePath: `${outputDir}/${slug}.md`, fileText: processedText });
	};

	applyToFilesRecursive({ dirPath: inputDir, processFileFn: processFileEntry });
}

/** Copy all image files referenced in markdown files to the output directory */
export function copyReferencedImageFiles({
	inputDir,
	outputDir,
	referencedImageFiles
}: {
	inputDir: string;
	outputDir: string;
	referencedImageFiles: Set<string>;
}) {
	const processFileEntry: ProcessFileFn = async ({ path }) => {
		const fileName = path.split('/').at(-1) as string;
		const dest = `${outputDir}/${fileName.replace(/ /g, '-')}`;
		if (referencedImageFiles.has(fileName)) {
			await copyFile({ fromPath: path, toPath: dest });
		}
	};

	applyToFilesRecursive({ dirPath: inputDir, processFileFn: processFileEntry });
}
