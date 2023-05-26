import { readTextFile } from '../file/fileUtils.ts';
import type { MarkdownFileSummary } from '../types.d.ts';
import { removeFileExtension } from './removeFileExtension.ts';
import { slugifyFileName } from './slugifyFileName.ts';

export async function generateMarkdownFileSummary({
	dirPath,
	fileName
}: {
	dirPath: `${string}/${string}`;
	fileName: `${string}.md`;
}): Promise<MarkdownFileSummary> {
	const filePath = `${dirPath}/${fileName}`;
	const fileText = await readTextFile(filePath);
	const fileNameWithoutExtension = removeFileExtension(fileName);
	const slug = slugifyFileName(fileNameWithoutExtension);
	return {
		slug,
		fileName,
		dirPath,
		fileText
	};
}
