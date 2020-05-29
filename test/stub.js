const test = require('ava');
const path = require('path');
const {createStub, createStubFromFixtures, resetStub, getStub, execa} = require('../src/stub');

test.serial('should load stubs from file with JSON-Array', async t => {
	await createStubFromFixtures(path.resolve('test', 'fixtures', 'array_echo*'));
	const expectedResults = require('./fixtures/array_echo.json');
	t.deepEqual(await execa('echo', ['hello', 'world']), {...expectedResults[0],
		all: 'hello world\n', failed: false, timedOut: false, isCanceled: false, killed: false});
});

test.serial('should load stubs from files with JSON-Object', async t => {
	await createStubFromFixtures(path.resolve('test', 'fixtures', 'object_echo*'));
	const expectedResult = require('./fixtures/object_echo_th.json');
	t.deepEqual(await execa('echo', ['hello', 'from', 'thailand']), {...expectedResult,
		all: 'hello from thailand\n', failed: false, timedOut: false, isCanceled: false, killed: false});
});

test.serial('should throw error when process terminated with `exitCode === 1`', async t => {
	createStub([{
		command: 'terminate',
		exitCode: 1,
		exitCodeName: 'EPERM',
		stdout: 'terminated',
		stderr: 'terminated'
	}]);
	await t.throwsAsync(execa('terminate'), {message: 'Command failed with exit code 1: terminate'});
});

test.serial('should throw error when unknown command supplied', async t => {
	createStub([{
		command: 'unknown',
		exitCodeName: 'ENOENT'
	}]);
	await t.throwsAsync(execa('unknown'), {message: 'Command failed with ENOENT: unknown'});
});

test.serial('should execute real command when command isn`t stubbed', async t => {
	resetStub();
	const expectedResult = require('./fixtures/object_echo_hw.json');
	t.deepEqual(await execa('echo', ['hello', 'world']), {...expectedResult,
		all: undefined, failed: false, timedOut: false, isCanceled: false, killed: false});
});

test.serial('can verify expectation', async t => {
	resetStub();
	createStub([{
		command: 'verify args',
		exitCode: 0,
		stdout: 'terminated',
		stderr: 'terminated'
	}]);
	await execa('verify', ['args']);
	t.true(getStub().withArgs('verify args').calledOnce);
	t.false(getStub().withArgs('echo hello world').called);
});

test.serial('can verify expectation of sync call', async t => {
	resetStub();
	createStub([{
		command: 'verify args',
		exitCode: 0,
		stdout: 'terminated',
		stderr: 'terminated'
	}]);
	await execa.sync('verify', ['args']);
	t.true(getStub().withArgs('verify args').calledOnce);
	t.false(getStub().withArgs('echo hello world').called);
});
