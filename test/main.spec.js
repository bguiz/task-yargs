'use strict';

var yargs = require('yargs');
var taskYargs = require('../index');

describe('[register without prerequisites]', function() {
  describe('[basic]', function() {
    it('Should register simple', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      var yargsInstance = tyInstance.get('blank', ['blank']);
      var argv = yargsInstance.argv;
      expect(argv._).toEqual(['blank']);
      done();
    });

    it('Should register without name as parameter but in defintion object instead', function(done) {
      var tyInstance = taskYargs();
      expect(function() {
        tyInstance.register({
          description: 'A blank task without a name and shouldn\'t be allowed to register',
          prerequisiteTasks: [],
          checks: [],
          options: [],
        });
      }).toThrowError('Must specify a task name');

      tyInstance.register({
        name: 'blank',
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      var yargsInstance = tyInstance.get('blank', ['blank']);
      var argv = yargsInstance.argv;
      expect(argv._).toEqual(['blank']);

      done();
    });

    it('Should register with optional onRun function', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('blank', {
        description: 'A blank task with an onRun function',
        prerequisiteTasks: [],
        checks: [],
        options: [],
        onRun: function() { /* do nothing */ },
      });
      var yargsInstance = tyInstance.get('blank', ['blank']);
      var argv = yargsInstance.argv;
      expect(argv._).toEqual(['blank']);
      done();
    });

    it('Should register with optional onInit function', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('blank', {
        description: 'A blank task with an onInit function',
        prerequisiteTasks: [],
        checks: [],
        options: [],
        onInit: function() { /* do nothing */ },
      });
      var yargsInstance = tyInstance.get('blank', ['blank']);
      var argv = yargsInstance.argv;
      expect(argv._).toEqual(['blank']);
      done();
    });

    it('Should NOT allow any tasks to be registered after first task has been retrieved', function(done) {
      var tyInstance = taskYargs();

      tyInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      var yargsInstance = tyInstance.get('blank', ['blank']);
      var exception;
      var yargsInstance;

      expect(function() {
        tyInstance.register('blank2', {
          description: 'A blank task',
          prerequisiteTasks: [],
          checks: [],
          options: [],
        });
      }).toThrowError('Not allowed to register new tasks after first task retrieval');
      done();
    });

    it('Should not allow two tasks with the same name to be registered', function(done) {
      var tyInstance = taskYargs();

      expect(function() {
          tyInstance.register('blank', {
          description: 'A blank task',
          prerequisiteTasks: [],
          checks: [],
          options: [],
        });
      }).not.toThrow();

      expect(function() {
        tyInstance.register('blank', {
          description: 'A task attempting to overwrite an existing task',
          prerequisiteTasks: [],
          checks: [],
          options: [],
        });
      }).toThrowError('A task has already been registered with the name blank');

      done();
    });
  });

  describe('[validations]', function() {
    var tyInstance = taskYargs();
    it('Should reject registrations without params', function(done) {
      expect(function() {
        tyInstance.register(undefined, {});
      }).toThrowError('Must specify a task name');
      expect(function() {
        tyInstance.register('', {});
      }).toThrowError('Must specify a task name');
      expect(function() {
        tyInstance.register('blank', undefined);
      }).toThrowError('Must specify task object');
      expect(function() {
        tyInstance.register('blank', 'notAnObject');
      }).toThrowError('Must specify task object');
      done();
    });

    it('Should reject badly formed task details', function(done) {
      expect(function() {
        tyInstance.register('noDescrioption', {
          description: undefined,
          prerequisiteTasks: [],
          checks: [],
          options: [],
        });
      }).toThrowError('Task must specify a description');
      expect(function() {
        tyInstance.register('noPrerequisites', {
          description: 'A task without prerequisites',
          prerequisiteTasks: undefined,
          checks: [],
          options: [],
        });
      }).toThrowError('Task must specify prerequisite tasks list');
      expect(function() {
        tyInstance.register('hiddenWrongType', {
          description: 'A task the a wrong type for hidden',
          prerequisiteTasks: [],
          checks: [],
          options: [],
          hidden: 'string',
        });
      }).toThrowError('If task specifies hidden, it must be Boolean');
      expect(function() {
        tyInstance.register('malformedPrerequisites', {
          description: 'A task with malformed prerequisites',
          prerequisiteTasks: ['ok', 123],
          checks: [],
          options: [],
        });
      }).toThrowError('Prerequisite task #1 is not a string');
      expect(function() {
        tyInstance.register('noChecks', {
          description: 'A task without checks',
          prerequisiteTasks: [],
          checks: undefined,
          options: [],
        });
      }).toThrowError('Task must specify checks list');
      expect(function() {
        tyInstance.register('malformedChecks', {
          description: 'A task with malformed checks',
          prerequisiteTasks: [],
          checks: [function() {}, 123],
          options: [],
        });
      }).toThrowError('Check #1 is badly formed');
      expect(function() {
        tyInstance.register('noOptions', {
          description: 'A task attempting to overwrite an existing task',
          prerequisiteTasks: [],
          checks: [],
          options: undefined,
        });
      }).toThrowError('Task must specify options list');
      expect(function() {
        tyInstance.register('malformedOptions', {
          description: 'A task attempting to overwrite an existing task',
          prerequisiteTasks: [],
          checks: [],
          options: [{ key: 'flag', value: {} }, 123],
        });
      }).toThrowError('Option #1 is badly formed');
      expect(function() {
        tyInstance.register('onRunWrongType', {
          description: 'A task attempting to assign an onRun that is not a function',
          prerequisiteTasks: [],
          checks: [],
          options: [],
          onRun: {},
        });
      }).toThrowError('Task onRun must be a function, if present');
      expect(function() {
        tyInstance.register('onInitWrongType', {
          description: 'A task attempting to assign an onInit that is not a function',
          prerequisiteTasks: [],
          checks: [],
          options: [],
          onInit: {},
        });
      }).toThrowError('Task onInit must be a function, if present');
      done();
    });

    it('Should reject retrieval of task that has not been registered', function(done) {
      expect(function() {
        tyInstance.get('task-that-does-not-exist');
      }).toThrowError('No task registered with name task-that-does-not-exist');
      done();
    });
  });

  describe('[subcommand]', function() {
    var tyInstance = taskYargs();
    tyInstance.register('blank', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [],
      options: [],
    });
    var exception;
    var yargsInstance;

    it('Should ensure exactly one', function(done) {
      expect(function() {
        yargsInstance = tyInstance.get('blank', []);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).toThrowError('Error: No task defined');

      expect(function() {
        yargsInstance = tyInstance.get('blank', ['blank', 'differentTask']);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).toThrowError('Error: More than one task defined');

      done();
    });

    it('Should ensure matches', function(done) {
      expect(function() {
        yargsInstance = tyInstance.get('blank', ['differentTask']);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).toThrowError('Error: Wrong task invoked: differentTask instead of blank');

      expect(function() {
        yargsInstance = tyInstance.get('blank', ['blank']);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).not.toThrow();

      done();
    });
  });

  describe('[list]', function() {
    it('Should register a hidden task', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('hidden', {
        description: 'A hidden task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
        hidden: true,
      });
      var taskNames = tyInstance.getNames();
      expect(taskNames).toEqual([]);
      taskNames = tyInstance.getNames(true);
      expect(taskNames).toEqual(['hidden']);
      done();
    });

    it('Should register a mixture of hidden and non hidden tasks', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register({
        name: 'hidden',
        description: 'A hidden task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
        hidden: true,
      });
      tyInstance.register({
        name: 'visible',
        description: 'A visible task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
        hidden: false,
      });
      tyInstance.register({
        name: 'hidden2',
        description: 'Another hidden task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
        hidden: true,
      });
      tyInstance.register({
        name: 'visible2',
        description: 'Another visible task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
        hidden: false,
      });
      var taskNames = tyInstance.getNames();
      expect(taskNames).toEqual(['visible', 'visible2']);
      taskNames = tyInstance.getNames(true);
      expect(taskNames).toEqual(['hidden', 'visible', 'hidden2', 'visible2']);
      done();
    });
  });
});
