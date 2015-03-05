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
      }).toThrow('Must specify a task name');

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
      }).toThrow('Not allowed to register new tasks after first task retrieval');
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
      }).toThrow('A task has already been registered with the name blank');

      done();
    });
  });

  describe('[validations]', function() {
    var tyInstance = taskYargs();
    it('Should reject registrations without params', function(done) {
      expect(function() {
        tyInstance.register(undefined, {});
      }).toThrow('Must specify a task name');
      expect(function() {
        tyInstance.register('', {});
      }).toThrow('Must specify a task name');
      expect(function() {
        tyInstance.register('blank', undefined);
      }).toThrow('Must specify task object');
      expect(function() {
        tyInstance.register('blank', 'notAnObject');
      }).toThrow('Must specify task object');
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
      }).toThrow('Task must specify a description');
      done();
      expect(function() {
        tyInstance.register('noPrerequisites', {
          description: 'A task without prerequisites',
          prerequisiteTasks: undefined,
          checks: [],
          options: [],
        });
      }).toThrow('Task must specify prerequisite tasks list');
      done();
      expect(function() {
        tyInstance.register('malformedPrerequisites', {
          description: 'A task with malformed prerequisites',
          prerequisiteTasks: ['ok', 123],
          checks: [],
          options: [],
        });
      }).toThrow('Prerequisite task #1 is not a string');
      done();
      expect(function() {
        tyInstance.register('noChecks', {
          description: 'A task without checks',
          prerequisiteTasks: [],
          checks: undefined,
          options: [],
        });
      }).toThrow('Task must specify checks list');
      done();
      expect(function() {
        tyInstance.register('malformedChecks', {
          description: 'A task with malformed checks',
          prerequisiteTasks: [],
          checks: [function() {}, 123],
          options: [],
        });
      }).toThrow('Check #1 is badly formed');
      done();
      expect(function() {
        tyInstance.register('noOptions', {
          description: 'A task attempting to overwrite an existing task',
          prerequisiteTasks: [],
          checks: [],
          options: undefined,
        });
      }).toThrow('Task must specify options list');
      done();
      expect(function() {
        tyInstance.register('malformedOptions', {
          description: 'A task attempting to overwrite an existing task',
          prerequisiteTasks: [],
          checks: [],
          options: [{ key: 'flag', value: {} }, 123],
        });
      }).toThrow('Option #1 is badly formed');
      expect(function() {
        tyInstance.register('onRunWrongType', {
          description: 'A task attempting to assign an onRun that is not a function',
          prerequisiteTasks: [],
          checks: [],
          options: [],
          onRun: {},
        });
      }).toThrow('Task onRun must be a function, if present');
      expect(function() {
        tyInstance.register('onInitWrongType', {
          description: 'A task attempting to assign an onInit that is not a function',
          prerequisiteTasks: [],
          checks: [],
          options: [],
          onInit: {},
        });
      }).toThrow('Task onInit must be a function, if present');
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
      }).toThrow('Error: No task defined');

      expect(function() {
        yargsInstance = tyInstance.get('blank', ['blank', 'differentTask']);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).toThrow('Error: More than one task defined');

      done();
    });

    it('Should ensure matches', function(done) {
      expect(function() {
        yargsInstance = tyInstance.get('blank', ['differentTask']);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).toThrow('Error: Wrong task invoked: differentTask instead of blank');

      expect(function() {
        yargsInstance = tyInstance.get('blank', ['blank']);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).not.toThrow();

      done();
    });
  });
});
