import { copyReferencedImageFiles, obsidianExport } from './obsidianExport.ts';
import { getMarkdownFileSummaries } from './utils/getMarkdownFileSummaries.ts';
import { isCriteriaMet } from './utils/markdown/isCriteriaMet.ts';
import { MarkdownFileSummary } from './utils/types.d.ts';

export const contentDirectory =
	'/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/obsidian';
const contentOutputDirectory = '/Users/braden/Code/optim/apps/blog-sveltekit/src/content/articles';
const assetsDirectory =
	'/Users/braden/Library/Mobile Documents/iCloud~md~obsidian/Documents/obsidian/assets';
const assetsOutputDirectory = '/Users/braden/Code/optim/apps/blog-sveltekit/public/assets';

const markdownFileSummaries = await getMarkdownFileSummaries(contentDirectory);

const markdownFileSlugs = getMarkdownFileSlugs({ markdownFileSummaries });
obsidianExport({
	inputDir: contentDirectory,
	outputDir: contentOutputDirectory,
	markdownFileSlugs
});

const referencedImageFiles = getReferencedImageFiles({ markdownFileSummaries });
copyReferencedImageFiles({
	inputDir: assetsDirectory,
	outputDir: assetsOutputDirectory,
	referencedImageFiles
});

function getMarkdownFileSlugs({
	markdownFileSummaries,
	isCriteriaMet
}: {
	markdownFileSummaries: MarkdownFileSummary[];
	isCriteriaMet?: (summary: MarkdownFileSummary) => boolean;
}): Set<string> {
	const slugs = new Set<string>();
	for (const summary of markdownFileSummaries) {
		if (isCriteriaMet && !isCriteriaMet(summary)) continue;
		slugs.add(summary.slug);
	}
	return slugs;
}

/** Returns a set of all image files referenced in the markdown files. */
function getReferencedImageFiles({
	markdownFileSummaries
}: {
	markdownFileSummaries: MarkdownFileSummary[];
}): Set<string> {
	const imageFiles = new Set<string>();
	const wikilinkRegex = /\[\[(.+?)\]\]/g;
	for (const summary of markdownFileSummaries) {
		if (!isCriteriaMet(summary)) continue;
		let match;
		while ((match = wikilinkRegex.exec(summary.fileText)) !== null) {
			imageFiles.add(match[1]);
		}
	}
	return imageFiles;
}
