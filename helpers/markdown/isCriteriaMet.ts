import { MarkdownFileSummary } from '../../types.d.ts';

export function isCriteriaMet({ fileText }: MarkdownFileSummary) {
	return fileText.includes('status: DONE');
}
