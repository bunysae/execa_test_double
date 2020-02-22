'use strict';

module.exports.joinCommand = (file, args = []) => {
	if (!Array.isArray(args)) {
		return file;
	}

	return [file, ...args].join(' ');
};

