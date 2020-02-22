const test = require('ava');
const path = require('path');
const {createStub, createStubFromFixtures, execa} = require('../src/stub');

test('should load stubs from directory', async t => {
	createStubFromFixtures(path.resolve('test', 'fixtures', 'echo*'));
	const expectedResults = require('./fixtures/echo.json');
	t.deepEqual(await execa('echo', ['hello', 'world']), {...expectedResults[0], all: 'hello world'});
});

test('should throw error when process terminated with `exitCode === 1`', async t => {
	createStub([{
		command: 'terminate',
		exitCode: 1,
		exitCodeName: 'EPERM',
		stdout: 'terminated',
		stderr: 'terminated',
		failed: true,
		timedOut: false,
		isCanceled: false,
		killed: false,
		signal: undefined
	}]);
	t.throwsAsync(await execa('terminate'), {message: 'Command failed with exit code 1 (EPERM): terminate'});
});

test('should throw error when unknown command supplied', async t => {
	createStub([{
		command: 'unknown',
		exitCodeName: 'ENOENT'
	}]);
	t.throwsAsync(await execa('unknown'), {message: 'Command failed with exit code 2 (ENOENT): unknown'});
});
