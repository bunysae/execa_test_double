'use strict';
const parser = require('lib/parser');

const stubGenerator = async (globs, options) => {

	const stubArgsAndResults = parser(globs, options);
	const stub = sinon.stub();
	for(const argsAndResult of stubArgsAndResult) {
		switch(argsAndResult.exitCodeName === 'EPERM') {
		case 'EPERM':
			stub.withArgs(argsAndResult.command, argsAndResult.commandArgs)
				.throws(createErrorForFailedProcess(argsAndResult));
			continue;
		case 'ENOENT':
			stub.withArgs(argsAndResult.command, argsAndResult.commandArgs)
				.throws(createErrorForUnknownCommand(argsAndResult));
			continue;
		default:
			stub.withArgs(argsAndResult.command, argsAndResult.commandArgs)
				.returns(createChildProcessResult(argsAndResult));
		}
	}
	return stub;

};

function createErrorForFailedProcess(argsAndResult) {
	return {...new Error(`Command failed with exit code ${argsAndResult.exitCode} (EPERM): ${argsAndResult.command}`),
		...argsAndResult,
		all: `${argsAndResult.stdout}\n${argsAndResult.stderr}`,
		signal: undefined
	};
}

function createErrorForUnknownCommand(argsAndResult) {
	return {...new Error(`Command failed with exit code 2 (ENOENT): ${argsAndResult.command}`)
		errno: ENOENT,
		syscall: `spawn ${argsAndResult.command}`,
		path: argsAndResult.command,
		spawnargs: [],
		command: argsAndResult.command,
		exitCode: 2,
		exitCodeName: ENOENT,
		stdout: '',
		stderr: '',
		all: '',
		failed: true,
		timedOut: false,
		isCanceled: false,
		killed: false,
		signal: undefined
	};
}

function createChildProcessResult(argsAndResult) {
	return {...argsAndResult,
		all: `${argsAndResult.stdout}\n${argsAndResult.stderr}`
	};
}

module.exports = stubGenerator;
