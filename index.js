'use strict';

var yargs = require('yargs');

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

function taskYargs() {
  /**
   * Keys are the task names
   * Values are objects, of type: {{
   *   description: string,
   *   prerequisiteTasks: Array<string>,
   *   checks: Array<object>,
   *   options: Array<object> }}
   */
  var tasks = {};

  var hasGotten = false;

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
    if (isObject(tasks[name])) {
      throw new Error('A task has already been registered with the name ' + name);
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
      throw new Error('Task must specify checks list');
    }
    else {
      task.options.forEach(function(option, index) {
        if (!isObject(option) || !isObject(option.value) || !isString(option.key)) {
          throw new Error('Option #'+index+' is badly formed');
        }
      });
    }
  }

  /**
   * Register a new task
   * Note that call calls to `registerTask` must precede any calls to `getTaskObjectByName`,
   * lest an `Error` be thrown.
   * @param {string} name The name of the task - must be unique
   * @param {object} task The definition for the task object
   */
  function registerTask(name, task) {
    if (hasGotten) {
      throw new Error('Not allowed to register new tasks after first task retrieval');
    }

    validateRegisterTask(name, task);

    tasks[name] = task;
  }

  /**
   * Get a list of all the prerequisite tasks (recursively) of the named task
   * @param {string} mainTaskName The task whose prerequisites we wish to find
   */
  function getAllPrereqTasks(mainTaskName) {
    var list = [];

    function addPrereqTasksToList(taskName) {
      var task = tasks[taskName];
      if (!task) {
        throw new Error('No task registered with name ' + taskName);
      }
      if (isArray(task.prerequisiteTasks)) {
        task.prerequisiteTasks.forEach(function(prereqTaskName) {
          list.push(prereqTaskName);
          addPrereqTasksToList(prereqTaskName); //recursion
        });
      }
    }

    addPrereqTasksToList(mainTaskName);
    list = list.filter(function(name, index, self) {
      return self.indexOf(name) === index;
    });

    return list;
  }

  /**
   * Retrieve the task object, and mutate to cache
   * recursively resolved prerequisite tasks
   * @param {string} name The name of the task
   */
  function getTaskObjectByName(name) {
    hasGotten = true;

    // retrieve
    var task = tasks[name];
    if (!task) {
        throw new Error('No task registered with name ' + name);
    }

    //use cached copy of resolved prerequisite tasks if present
    if (!isArray(task.resolvedPrerequisiteTasks)) {
      task.resolvedPrerequisiteTasks = getAllPrereqTasks(name);
    }

    return task;
  }

  /**
   * Return a yargs instance for the selected task
   * Computes the options and checks of all the prerequisite tasks
   * and adds them accordingly to the yargs instance
   * @param {string} name The name of the task
   * @param {Array<string>} [processArgv] An array of parameters to specify
   *   in lieu of the `process.argv`
   */
  function getTaskByName(name, processArgv) {
    processArgv = processArgv || process.argv;
    var task = getTaskObjectByName(name);

    //populate with options and checks from prerequisite tasks
    var yargsInstance = yargs(processArgv.slice(1));
    yargsInstance
      .command(name, task.description)
      .demand(1);
    var taskAndPrereqs = [name].concat(task.resolvedPrerequisiteTasks);
    taskAndPrereqs.forEach(function(taskName) {
      var selectedTask = tasks[taskName];
      selectedTask.options.forEach(function(prereqOption) {
        yargsInstance.option(prereqOption.key, prereqOption.value);
      });
      selectedTask.checks.forEach(function(prereqCheck) {
        yargsInstance.check(prereqCheck);
      });
    });

    yargsInstance.argv;
    return yargsInstance;
  }

  return {
    register: registerTask,
    get: getTaskByName,
    getDefinition: getTaskObjectByName,
  };
}

module.exports = taskYargs;
