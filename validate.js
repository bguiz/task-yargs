'use strict';

function isString(thing) {
  return (typeof thing === 'string');
}

function isFunction(thing) {
  return (typeof thing === 'function');
}

function isObject(thing) {
  return (Object.prototype.toString.call(thing) === '[object Object]');
}

function isArray(thing) {
  return (Object.prototype.toString.call(thing) === '[object Array]');
}

/**
 * Throws various `Error`s should a task not be allowed to register
 * @param {string} name The name of the task - must be unique
 * @param {object} task The definition for the task object
 */
function validateRegisterTask(name, task) {
  if (!isString(name) || name.length < 1) {
    throw new Error('Must specify a task name');
  }
  if (!isObject(task)) {
    throw new Error('Must specify task object');
  }
  if (!isString(task.description)) {
    throw new Error('Task must specify a description');
  }
  if (!isArray(task.prerequisiteTasks)) {
    throw new Error('Task must specify prerequisite tasks list');
  }
  else {
    task.prerequisiteTasks.forEach(function(prerequisiteTask, index) {
      if (!isString(prerequisiteTask)) {
        throw new Error('Prerequisite task #'+index+' is not a string');
      }
    });
  }
  if (!isArray(task.checks)) {
    throw new Error('Task must specify checks list');
  }
  else {
    task.checks.forEach(function(check, index) {
      if (!isFunction(check)) {
        throw new Error('Check #'+index+' is badly formed');
      }
    });
  }
  if (!isArray(task.options)) {
    throw new Error('Task must specify options list');
  }
  else {
    task.options.forEach(function(option, index) {
      if (!isObject(option) || !isString(option.key) || !isObject(option.value)) {
        throw new Error('Option #'+index+' is badly formed');
      }
    });
  }
}

function getCheckForEnsureCommandMatchesTaskName(name) {
  return function checkEnsureCommandMatchesTaskName(argv) {
    if (!isArray(argv._) || argv._.length === 0) {
      throw new Error('No task defined');
    }
    else if (isArray(argv._) && argv._.length !== 1) {
      console.log('argv._', argv._);
      throw new Error('More than one task defined');
    }
    else if (isArray(argv._) && argv._[0] !== name) {
      throw new Error('Wrong task invoked: ' + argv._[0] + ' instead of ' + name);
    }
    else {
      return true;
    }
  };
}

module.exports = {
  registerTask: validateRegisterTask,
  getCheck: {
    ensureCommandMatchesTaskName: getCheckForEnsureCommandMatchesTaskName,
  },
  isString: isString,
  isFunction: isFunction,
  isObject: isObject,
  isArray:isArray,
};
