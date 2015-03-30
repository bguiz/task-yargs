'use strict';

var validate = require('./validate');

function taskYargsFluent(tyInstance) {
  if (!tyInstance) {
    var taskYargs = require('./index');
    tyInstance = taskYargs();
  }

  function newFluentTask(name) {
    var fluent = {
      definition: {
        name: name,
        description: undefined,
        prerequisiteTasks: [],
        checks: [],
        options: [],
        hidden: false,
        onInit: undefined,
        onRun: undefined,
      },
    };
    fluent.describe = function setDescription(text) {
      fluent.definition.description = text;
      return fluent;
    };
    fluent.hidden = function setHidden(hidden) {
      fluent.definition.hidden = (typeof hidden === 'undefined') ? true : !!hidden;
      return fluent;
    };
    fluent.onInit = function setOnInit(onInit) {
      fluent.definition.onInit = onInit;
      return fluent;
    };
    fluent.onRun = function setOnRun(onRun) {
      fluent.definition.onRun = onRun;
      return fluent;
    };
    fluent.prerequisite = function addPrerequisiteTask(taskName) {
      fluent.definition.prerequisiteTasks =
        fluent.definition.prerequisiteTasks.concat(taskName);
      return fluent;
    };
    fluent.check = function addCheck(check) {
      fluent.definition.checks =
        fluent.definition.checks.concat(check);
      return fluent;
    };
    fluent.option = function addOption(option) {
      fluent.definition.options =
        fluent.definition.options.concat(option);
      return fluent;
    };
    fluent.register = function register() {
      tyInstance.register(fluent.definition);
      // Terminates fluent interface - does not return the fluent interface,
      // but rather the object it was building instead
      return fluent.definition;
    };
    return fluent;
  }

  function createFluentTask(name) {
    return newFluentTask(name);
  }

  return {
    taskYargs: tyInstance,
    create: createFluentTask,
  };
}

module.exports = taskYargsFluent;
