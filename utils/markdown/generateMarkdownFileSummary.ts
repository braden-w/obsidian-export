import { readTextFile } from '../file/fileUtils.ts';
import type { MarkdownFileSummary } from '../types.d.ts';
import { removeFileExtension } from './removeFileExtension.ts';
import { slugifyFileName } from './slugifyFileName.ts';

export async function generateMarkdownFileSummary({
	path
}: {
	path: `${string}.md`;
}): Promise<MarkdownFileSummary> {
	const fileText = await readTextFile({ path });
	const fileName = path.split('/').at(-1) as `${string}.md`;
	const fileNameWithoutExtension = removeFileExtension({ fileName });
	const slug = slugifyFileName(fileNameWithoutExtension);
	return {
		slug,
		path,
		fileText
	};
}
