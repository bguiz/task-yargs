'use strict';

var taskYargsFluent = require('./fluent');

function taskYargsRun(tyInstance) {
  if (!tyInstance) {
    var taskYargs = require('./index');
    tyInstance = taskYargs();
  }
  var tyFluentInstance = taskYargsFluent(tyInstance);

  function initialise(taskName, yargsInstance) {
    // Call onInit of all prerequisite tasks which them
    var taskDefinition = tyInstance.getDefinition(taskName);
    var taskAndPrereqs = [].concat(taskDefinition.resolvedPrerequisiteTasks).concat(taskName);
    taskAndPrereqs.map(function(name) {
      return tyInstance.getDefinition(name).onInit;
    }).filter(function(onInit) {
      return (typeof onInit === 'function');
    }).forEach(function(onInit) {
        onInit(yargsInstance);
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
      initialise(taskName, yargsInstance);
      onRun(yargsInstance);
    }
    else {
      throw new Error('Task definition for "' + taskName +
        '" does not define an onRun function, and no default was provided');
    }
  }

  function runCurrent(onRun, processArgv) {
    processArgv = processArgv ||
      /* istanbul ignore next: cannot test in jasmine */ process.argv;
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
    fluent: tyFluentInstance,
    byName: runByName,
    current: runCurrent,
  };
}

module.exports = taskYargsRun;
