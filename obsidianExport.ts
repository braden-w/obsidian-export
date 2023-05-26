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
