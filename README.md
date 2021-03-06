# Create test doubles of `execa`

![Build Status](https://github.com/bunysae/execa_test_double/workflows/Node.js%20CI/badge.svg)

With this library you can build test doubles for
[process execution with `execa`](https://github.com/sindresorhus/execa).

## Install

```
npm install execa_test_double
```

## Usage

### Stubbing
Inline stubbing with [mockery](https://github.com/mfncooper/mockery):
```js
const execaTestDouble = require('execa_test_double');
const mockery = require('mockery');

(async () => {
	execaTestDouble.createStub([{
		command: "echo hello world",
		exitCode: 0,
		stdout: "hello world",
		stderr: ""
	}]);

	mockery.registerMock('execa', execaTestDouble.execa);
	mockery.enable({useCleanCache: true});

	//expected output `hello world`
	const execa = require('execa');
	console.log(await execa('echo', ['hello', 'world']));

	mockery.disable();
	mockery.deregisterAll();
})();
```

### Verify expectations
Stubbed invocations can be verified with the `getStub()` function:
```js
const execaTestDouble = require('execa_test_double');
const mockery = require('mockery');

(async () => {
	execaTestDouble.createStub([{
		command: "echo hello world",
		exitCode: 0,
		stdout: "hello world",
		stderr: ""
	}]);

	mockery.registerMock('execa', execaTestDouble.execa);
	mockery.enable({useCleanCache: true});

	const execa = require('execa');
	console.log(await execa('echo', ['hello', 'world']));

	assert.true(execaTestDouble.getStub().withArgs('echo hello world').calledOnce);

	mockery.disable();
	mockery.deregisterAll();
})();
```
The verification methods of [sinon spies](https://sinonjs.org/releases/v9.0.0/spies/) can be used.

## API

### Stubbing

#### createStub(processes)
Creates stubs for processes. For `processes` a array with
the type [`childProcessResult`](https://github.com/sindresorhus/execa#childProcessResult) is expected.
For an successful execution please supply the following properties:
```js
{
	// command (file and arguments)
        command: "echo hello world",
        exitCode: 0,
        stdout: "hello world",
        stderr: ""
}
```

For an command, which terminates with `exitCode !== 0`:
```js
{
	command: "terminate",
	exitCode: 1,
	exitCodeName: "EPERM",
	stdout: "",
	stderr: "terminated"
}
```

For an unknown file:
```js
{
	command: "unknown",
	exitCodeName: "ENOENT"
}

```

The stub behavior is reseted at every invocation of this method.
The real command is executed, if it isn't stubbed.

#### async createStubFromFixtures(globs, options)
Reads the stubs from JSON-Files (JSON-Array or JSON-Object).
[Globby](https://github.com/sindresorhus/globby) is used for path
filtering. The parameter `globs` and `options` are
directly passed to globby.

The stub behavior is reseted at every invocation of this method.
The real command is executed, if it isn't stubbed.

#### resetStub
Resets the history and the behavior of the stub.

#### getStub
Returns the [sinon stub](https://sinonjs.org/releases/v9.0.0/stubs).

## Versioning
The major and minor component of the version number
will be keeped in sync with `execa`.
