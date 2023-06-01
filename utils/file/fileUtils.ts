export function readTextFile({ path }: { path: string }) {
	return Deno.readTextFile(path);
}

export async function writeTextFile({
	filePath,
	fileText
}: {
	filePath: string;
	fileText: string;
}) {
	return await Deno.writeTextFile(filePath, fileText);
}

export async function copyFile({ fromPath, toPath }: { fromPath: string; toPath: string }) {
	return await Deno.copyFile(fromPath, toPath);
}

export function readDir({ path }: { path: string }) {
	return Deno.readDir(path);
}

export async function mkdir({ path }: { path: string }) {
	return await Deno.mkdir(path);
}
