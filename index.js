'use strict';

var yargs = require('yargs');

var validate = require('./validate');

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
   * Register a new task
   * Note that call calls to `registerTask` must precede any calls to `getTaskObjectByName`,
   * lest an `Error` be thrown.
   * @param {string} name The name of the task - must be unique
   * @param {object} task The definition for the task object
   */
  function registerTask(name, task) {
    if (validate.isObject(name) && name.name) {
      task = name;
      name = task.name;
    }
    if (hasGotten) {
      throw new Error('Not allowed to register new tasks after first task retrieval');
    }
    if (validate.isObject(tasks[name])) {
      throw new Error('A task has already been registered with the name ' + name);
    }

    validate.registerTask(name, task);

    task.name = name;
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
      if (validate.isArray(task.prerequisiteTasks)) {
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
    if (!validate.isArray(task.resolvedPrerequisiteTasks)) {
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
    var yargsInstance = yargs(processArgv);
    yargsInstance.usage(task.description);
    yargsInstance
      .check(validate.getCheck.ensureCommandMatchesTaskName(name));
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

    return yargsInstance;
  }

  function getCurrentTaskName(processArgv) {
    processArgv = processArgv || process.argv;
    var argv = yargs(processArgv).argv;
    if (argv && validate.isArray(argv._) && argv._.length > 2) {
      var taskName = argv._[2];
      if (validate.isObject(tasks[taskName])) {
        return taskName;
      }
    }
  }

  function getCurrentTask(processArgv) {
    processArgv = processArgv || process.argv;
    var taskName = getCurrentTaskName(processArgv);
    if (taskName) {
      return getTaskByName(taskName, processArgv.slice(2));
    }
  }

  function getTaskNames(showHidden) {
    var names = [];
    for (var taskName in tasks) {
      if (tasks.hasOwnProperty(taskName)) {
        names.push(taskName);
      }
    }
    if (!showHidden) {
      names = names.filter(function(name) {
        var task = tasks[name];
        return !task.hidden;
      });
    }
    return names;
  }

  return {
    register: registerTask,
    get: getTaskByName,
    getDefinition: getTaskObjectByName,
    getCurrent: getCurrentTask,
    getCurrentName: getCurrentTaskName,
    getNames: getTaskNames,
  };
}

module.exports = taskYargs;
