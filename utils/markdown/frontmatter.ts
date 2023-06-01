import { parse } from 'https://deno.land/x/frontmatter/mod.ts';
import { z } from 'https://deno.land/x/zod/mod.ts';

import type { MarkdownFileSummary } from '../types.d.ts';

const articleSchema = z.object({
	title: z.string().optional(),
	alias: z.string().nullable(),
	tags: z
		.string()
		.nullable()
		.transform((tags) => tags?.split(',').map((tag) => tag.trim())),
	resonance: z.number().nullable(),
	subtitle: z.string().nullable(),
	date: z.date(),
	'date modified': z.date().nullable(),
	'link-twitter': z.string().url().nullable(),
	'link-medium': z.string().url().nullable(),
	'link-substack': z.string().url().nullable(),
	'link-reddit': z.string().url().nullable(),
	'link-github': z.string().url().nullable()
});

export function getArticleFrontmatter({ fileText, path }: MarkdownFileSummary) {
	try {
		const { data } = parse(fileText);
		const dataParsed = articleSchema.parse(data);
		return { data: dataParsed };
	} catch (error) {
		return { error: { path, message: error.message } };
	}
}
