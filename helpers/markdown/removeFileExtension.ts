import type { MarkdownFileSummary } from '../../types.d.ts';

export function removeFileExtension(fileName: MarkdownFileSummary['fileName']): string {
	return fileName.slice(0, -3);
}
