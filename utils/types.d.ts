export type Slug = string;

export type MarkdownFileSummary = {
	slug: Slug;
	path: `${string}.md`;
	fileText: string;
};
