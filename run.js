'use strict';

var taskYargs = require('./index');

function taskYargsRun() {
  var tyInstance = taskYargs();

  function initialise(taskName) {
    // Call onInit of all prerequisite tasks which them
    var taskDefinition = tyInstance.getDefinition(taskName);
    var taskAndPrereqs = [].concat(taskDefinition.resolvedPrerequisiteTasks).concat(taskName);
    taskAndPrereqs.map(function(name) {
      return tyInstance.getDefinition(name).onInit;
    }).filter(function(onInit) {
      return (typeof onInit === 'function');
    }).forEach(function(onInit) {
        onInit();
    });
  }

  function runByName(taskName, onRun, processArgv) {
    processArgv = processArgv || process.argv;

    if (typeof onRun !== 'function') {
      // If a default onRun function is provided,
      // it will supersede the one defined in the task defintion
      var taskDefinition = tyInstance.getDefinition(taskName);
      onRun = taskDefinition.onRun;
    }

    if (typeof onRun === 'function') {
      var yargsInstance = tyInstance.get(taskName, processArgv.slice(2));
      initialise(taskName);
      onRun(yargsInstance);
    }
    else {
      throw new Error('Task definition for "' + taskName +
        '" does not define an onRun function, and no default was provided');
    }
  }

  function runCurrent(onRun, processArgv) {
    processArgv = processArgv || process.argv;
    var cliArgs;
    var taskName = tyInstance.getCurrentName(processArgv);
    if (taskName) {
      var yargsInstance = tyInstance.get(taskName, processArgv.slice(2));
      cliArgs = yargsInstance.argv;
      if (cliArgs.help) {
        yargsInstance.showHelp();
      }
      else {
        runByName(taskName, onRun, processArgv);
      }
    }
  }

  return {
    taskYargs: tyInstance,
    byName: runByName,
    current: runCurrent,
  };
}

module.exports = taskYargsRun;
