'use strict';
const sinon = require('sinon');
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
	const result = new Error(`Command failed with exit code ${process.exitCode} (EPERM): ${process.command}`);
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
	const result = new Error(`Command failed with exit code 2 (ENOENT): ${process.command}`);
	result.errno = 'ENOENT';
	result.syscall = `spawn ${process.command}`;
	result.path = process.command;
	result.spawnargs = [];
	result.command = process.command;
	result.exitCode = 2;
	result.exitCodeName = 'ENOENT';
	result.stdout = '';
	result.stderr = '';
	result.all = '';
	result.failed = true;
	result.timedOut = false;
	result.isCanceled = false;
	result.killed = false;
	return result;
}

function createChildProcessResult(process) {
	return {...process,
		all: `${process.stdout}\n${process.stderr}`
	};
}

module.exports.createStubFromFixtures = async (globs, options) => {
	stubGenerator(await parser(globs, options));
};

module.exports.createStub = stubGenerator;

module.exports.execa = async (command, args) => {
	return stub(joinCommand(command, args));
};

module.exports.execa.sync = (command, args) => {
	return stub(joinCommand(command, args));
};

module.exports.execa.command = async command => {
	return stub(command);
};

module.exports.execa.commandSync = command => {
	return stub(command);
};

module.exports.execa.node = (scriptPath, args) => {
	return stub(joinCommand(
		process.execPath,
		[
			...process.execArgv,
			scriptPath,
			...(Array.isArray(args) ? args : [])
		]));
};
