# `task-yargs`

Create sub-task oriented common line interfaces with yargs easily.

[![NPM](https://nodei.co/npm/task-yargs.png)](https://github.com/bguiz/task-yargs/)

[![Build Status](https://travis-ci.org/bguiz/task-yargs.svg?branch=master)](https://travis-ci.org/bguiz/task-yargs)

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

## Author

Maintained by Brendan Graetz

[bguiz.com/](http://bguiz.com/)

## Licence

GPLv3
