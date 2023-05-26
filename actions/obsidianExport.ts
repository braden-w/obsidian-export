import { copyFile, writeTextFile } from '../helpers/bridge/denoBridge.ts';
import { getMarkdownFileSlugs } from '../helpers/collection/derivedSets.ts';
import { ProcessFileFn, applyToFilesRecursive } from '../helpers/file/applyToFilesRecursive.ts';
import { generateMarkdownFileSummary } from '../helpers/markdown/generateMarkdownFileSummary.ts';
import { isCriteriaMet } from '../helpers/markdown/isCriteriaMet.ts';
import { processText } from '../helpers/markdown/processText.ts';
import { MarkdownFileSummary } from '../types.d.ts';

export function obsidianExport({
	inputDir,
	outputDir,
	markdownFileSummaries
}: {
	inputDir: string;
	outputDir: string;
	markdownFileSummaries: MarkdownFileSummary[];
}) {
	const markdownFileSlugs = getMarkdownFileSlugs({ markdownFileSummaries });

	const processFileEntry: ProcessFileFn = async ({ dirPath, fileName }) => {
		if (!fileName.endsWith('.md')) return;
		const markdownSummary = await generateMarkdownFileSummary({
			dirPath: dirPath as `${string}/${string}`,
			fileName: fileName as `${string}.md`
		});
		if (!isCriteriaMet(markdownSummary)) return;
		const processedText = processText(markdownSummary, markdownFileSlugs);
		const { slug } = markdownSummary;
		await writeTextFile(`${outputDir}/${slug}.md`, processedText);
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
	const processFileEntry: ProcessFileFn = async ({ dirPath, fileName }) => {
		const src = `${dirPath}/${fileName}`;
		const dest = `${outputDir}/${fileName.replace(/ /g, '-')}`;

		if (referencedImageFiles.has(fileName)) {
			await copyFile(src, dest);
		}
	};

	applyToFilesRecursive({ dirPath: inputDir, processFileFn: processFileEntry });
}
