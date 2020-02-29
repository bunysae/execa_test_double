'use strict';
const sinon = require('sinon');
const execa = require('execa');
const parser = require('./lib/parser');
const {joinCommand} = require('./lib/util');

const stub = sinon.stub();

const stubGenerator = processes => {
	if (!Array.isArray(processes)) {
		throw new TypeError('Only arrays can be supplied to this function');
	}

	stub.reset();
	for (const process of processes) {
		switch (process.exitCodeName) {
			case 'EPERM':
				stub.withArgs(process.command)
					.throws(createErrorForFailedProcess(process));
				continue;
			case 'ENOENT':
				stub.withArgs(process.command)
					.throws(createErrorForUnknownCommand(process));
				continue;
			default:
				stub.withArgs(process.command)
					.returns(createChildProcessResult(process));
		}
	}
};

function createErrorForFailedProcess(process) {
	const result = new Error(`Command failed with exit code ${process.exitCode}: ${process.command}`);
	result.shortMessage = result.message;
	result.command = process.command;
	result.exitCode = process.exitCode;
	result.stdout = process.stdout;
	result.stderr = process.stderr;
	result.failed = true;
	result.timedOut = false;
	result.isCanceled = false;
	result.killed = false;
	result.all = `${process.stdout}\n${process.stderr}`;
	return result;
}

function createErrorForUnknownCommand(process) {
	const result = new Error(`Command failed with ENOENT: ${process.command}`);
	result.errno = 'ENOENT';
	result.syscall = `spawn ${process.command}`;
	result.path = process.command;
	result.spawnargs = [];
	result.originalMessage = 'spawn unknown ENOENT';
	result.shortMessage = `Command failed with ENOENT: ${process.command}\n`;
	result.command = process.command;
	result.exitCode = undefined;
	result.signal = undefined;
	result.signalDescription = undefined;
	result.stdout = '';
	result.stderr = '';
	result.failed = true;
	result.timedOut = false;
	result.isCanceled = false;
	result.killed = false;
	return result;
}

function createChildProcessResult(process) {
	return {...process,
		all: `${process.stdout}\n${process.stderr}`,
		failed: false,
		timedOut: false,
		isCanceled: false,
		killed: false
	};
}

module.exports.createStubFromFixtures = async (globs, options) => {
	stubGenerator(await parser(globs, options));
};

module.exports.createStub = stubGenerator;

module.exports.resetStub = () => {
	stub.reset();
};

module.exports.execa = async (command, args) => {
	if (stub(joinCommand(command, args))) {
		return stub(joinCommand(command, args));
	}

	return execa(command, args);
};

module.exports.execa.sync = (command, args) => {
	if (stub(joinCommand(command, args))) {
		return stub(joinCommand(command, args));
	}

	return execa(command, args);
};

module.exports.execa.command = async command => {
	if (stub(command)) {
		return stub(command);
	}

	return execa(command);
};

module.exports.execa.commandSync = command => {
	if (stub(command)) {
		return stub(command);
	}

	return execa(command);
};

module.exports.execa.node = (scriptPath, args) => {
	const stubbedResult = stub(joinCommand(
		process.execPath,
		[
			...process.execArgv,
			scriptPath,
			...(Array.isArray(args) ? args : [])
		]));
	if (stubbedResult) {
		return stubbedResult;
	}

	return execa.node(scriptPath, args);
};
