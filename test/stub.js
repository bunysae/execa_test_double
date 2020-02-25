const test = require('ava');
const path = require('path');
const {createStub, createStubFromFixtures, execa} = require('../src/stub');

test.serial('should load stubs from file with JSON-Array', async t => {
	await createStubFromFixtures(path.resolve('test', 'fixtures', 'array_echo*'));
	const expectedResults = require('./fixtures/array_echo.json');
	t.deepEqual(await execa('echo', ['hello', 'world']), {...expectedResults[0], all: 'hello world\n'});
});

test.serial('should load stubs from files with JSON-Object', async t => {
	await createStubFromFixtures(path.resolve('test', 'fixtures', 'object_echo*'));
	const expectedResult = require('./fixtures/object_echo_th.json');
	t.deepEqual(await execa('echo', ['hello', 'from', 'thailand']), {...expectedResult, all: 'hello from thailand\n'});
});

test.serial('should throw error when process terminated with `exitCode === 1`', async t => {
	createStub([{
		command: 'terminate',
		exitCode: 1,
		exitCodeName: 'EPERM',
		stdout: 'terminated',
		stderr: 'terminated'
	}]);
	await t.throwsAsync(execa('terminate'), {message: 'Command failed with exit code 1 (EPERM): terminate'});
});

test.serial('should throw error when unknown command supplied', async t => {
	createStub([{
		command: 'unknown',
		exitCodeName: 'ENOENT'
	}]);
	await t.throwsAsync(execa('unknown'), {message: 'Command failed with exit code 2 (ENOENT): unknown'});
});
