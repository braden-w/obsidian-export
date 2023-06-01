export function removeFileExtension({ fileName }: { fileName: `${string}.md` }): string {
	return fileName.slice(0, -3);
}
