'use strict';
const globby = require('globby');
const fs = require('fs');

const parseArgsTestDoublesFromFS = async (globs, options) => {

	const paths = await globby(globs, options);
	let result = [];
	for(const path of paths) {
		result.push(JSON.parse(fs.readFileSync(path)));
	}
	return result;

};

module.exports = parseArgsTestDoublesFromFS;
