'use strict';
const globby = require('globby');
const fs = require('fs');

const parseArgsTestDoublesFromFS = async (globs, options) => {
	const paths = await globby(globs, options);
	let result = [];
	for (const path of paths) {
		const content = JSON.parse(fs.readFileSync(path));
		if (Array.isArray(content)) {
			result = result.concat(content);
		} else if (typeof content === 'object') {
			result.push(content);
		}
	}

	return result;
};

module.exports = parseArgsTestDoublesFromFS;
