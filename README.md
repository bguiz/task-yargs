# `task-yargs`

Create sub-task oriented command line interfaces with yargs easily.

[![NPM](https://nodei.co/npm/task-yargs.png)](https://github.com/bguiz/task-yargs/)

[![Build Status](https://travis-ci.org/bguiz/task-yargs.svg?branch=master)](https://travis-ci.org/bguiz/task-yargs)
[![Coverage Status](https://coveralls.io/repos/bguiz/task-yargs/badge.svg?branch=master)](https://coveralls.io/r/bguiz/task-yargs?branch=master)

## What is "sub-task oriented"?

Some programs have a command line interface which exposes a single global interface.
Great examples of it are:

- `ls`
- `tail`

However, some programs are complex enough,
such that they perform several distinct tasks.
As a result, the set of flags and options varies greatly from one task to another.
Great examples are:

- `npm`
  - e.g. `npm init`, `npm publish`
- `git`
  - e.g. `git clone`, `git commit`

These latter programs are "sub-task oriented".

## `yargs`

[`yargs`](https://github.com/bcoe/yargs) is a great NodeJs module for parsing
command line arguments.
It exposes a fluent interface,
and exposes a no-nonsense means of defining and querying the various flags.

For programs which expose a single global command line interface, it is perfect.
One shortcoming it has, however,
it that it does not allow you to define and manage multiple sub-tasks.
This is where `task-yargs` comes in.

## Prerequisite tasks

One of the main caveats encountered during the building of multiple instances
of `yargs` within the same NodeJs program,
is that several different sub-tasks will have various flags and options
in common with each other.
There needs to be an easy way for one task to say that it would like to
use the flags and options that have been defined in a another task,
without having to repeat or redefine them
This module calls these "prerequisite tasks".

Prerequisite tasks help to keep your `yargs` definitions
[DRY](http://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

When a sub-task defines one or more of the other sub-tasks as its prerequisite tasks,
all the `yargs` checks and options defined, recursively,
by its prerequisite tasks are defined upon itself automatically.
This allows one to adhere to DRY principles in defining each of the sub-tasks.

## Usage

In your project directory: `npm install task-yargs --save`

### Entry Point

In the entry point for your project - usually `index.js` or `bin/cli.js`,
import `task-yargs`:

```javascript
var taskYargs = require('task-yargs');
```

... and you are good to go with the `task-yargs` API.

To do something useful, you might use it like so, also in the same entry point file:

```javascript
var cliArgs;
var taskName = taskYargs.getCurrentName();
if (taskName) {
  var yargsInstance = taskYargs.getCurrent();
  cliArgs = yargsInstance.argv;
  // assuming that all your subtasks expose a `--help` flag
  if (cliArgs.help) {
    yargsInstance.showHelp();
  }
  else {
    // Run the subtask by the name of `taskName`
    // e.g. When using gulp, use `run-sequence` to invoke the appropriate gulp task
    require('run-sequence')(taskName);
  }
}
else {
  // Display an error message as no recognised subtask was specified
}
```

### Querying the CLI Parameters

Of course, once you invoke the function for the sub task,
you will need to respond to it,
which involves appropriately identifying the command line parameters.

```javascript
function fooTask() {
  // `taskYargs.getCurrent()` return a regular `yargs` instance
  // so simply use it as you would any other `yargs` instance
  var yargsInstance = taskYargs.getCurrent();
  yargsInstance.strict().wrap(100);
  var argv = yargsInstance.argv;

  // Now do stuff based on the `argv` object
}
```

### Register

The above will not work unless `task-yargs` has been registered with a task.
To do so, pass the **same instance** as the one used in the entry point file,
to wherever you wish to register it.
This could be anywhere, but it makes the most sense to place it in either:

- The entry point file
- The file containing the function responding to that subtask

```javascript
taskYargs.register('foo', {
  description: '"foo" does blah blah',
  prerequisiteTasks: ['bar'], // be sure to register a `bar` task elsewhere
  options: [
    // The `key` and `value` are passed to `yargs.option(key, value)`
    {
      key: 'baz',
      value: {
        describe: 'Set value of baz',
        alias: ['b'],
        string: true,
        default: false
      }
    }
  ],
  checks: [
    // A check function to pass to `yargs.check()`
    function checkFoo(argv) {
      if (argv.help) {
        return true;
      }
      else if (argv.baz === 'illegalValue') {
        throw new Error('Value of baz option is illegal');
      }
      else {
        return true;
      }
    }
  ]
});
```

## Contributing

This repository uses the **git flow** branching strategy.
If you wish to contribute, please branch from the **develop** branch -
pull requests will only be requested if they request merging into the develop branch.

## Author

Maintained by Brendan Graetz

[bguiz.com](http://bguiz.com/)

## Licence

GPLv3
