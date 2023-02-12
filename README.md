# Old

Write a Node.js Typescript script that does the following:

For each file in the Content/ folder:
Run the "processText" function on the file's text and then copy the result into the "Output/" folder

The processText function should find wikilinks `[[${fileName}]]` and do the following:

1. If the file linked is not in the Content/ folder, then turn this wikilink into `*${fileName}*`
2. Otherwise, turn this wikilink into a markdown link of style `[${fileName}](${slugified(fileName)})` where slugified is another function.

# New

Write a Deno Typescript script that does the following:

For each Markdown file in the contentDirectory:
Run the "processText" function on the file's text and then copy the result into the outputDirectory folder

In this case,
contentDirectory= "/Users/braden/Code/obsidian/"
outputDirectory="/Users/braden/Code/optim/src/content/articles"

The processText function should find wikilinks `[[${fileName}]]` and do the following:

1. If the file linked is not in the Content/ folder, then turn this wikilink into `*${fileName}*`
2. Otherwise, turn this wikilink into a markdown link of style `[${fileName}](${slugified(fileName)})` where slugified is another function.

The slugified function should take in a string fileName and replace all characters except alphanumeric and hyphens and underscores with a dash, and then lowercase the entire string.
