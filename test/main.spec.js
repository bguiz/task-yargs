'use strict';

var yargs = require('yargs');
var taskYargs = require('../index');

describe('[register without prerequisites]', function() {
  describe('[basic]', function() {
    it('Should register simple', function(done) {
      var taskYargsInstance = taskYargs();
      taskYargsInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      var yargsInstance = taskYargsInstance.get('blank', ['blank']);
      var argv = yargsInstance.argv;
      expect(argv._).toEqual(['blank']);
      done();
    });

    it('Should NOT allow any tasks to be registered after first task has been retrieved', function(done) {
      var taskYargsInstance = taskYargs();

      taskYargsInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      var yargsInstance = taskYargsInstance.get('blank', ['blank']);
      var exception;
      var yargsInstance;

      expect(function() {
        taskYargsInstance.register('blank2', {
          description: 'A blank task',
          prerequisiteTasks: [],
          checks: [],
          options: [],
        });
      }).toThrow('Not allowed to register new tasks after first task retrieval');
      done();
    });

    it('Should not allow two tasks with the same name to be registered', function(done) {
      var taskYargsInstance = taskYargs();

      expect(function() {
          taskYargsInstance.register('blank', {
          description: 'A blank task',
          prerequisiteTasks: [],
          checks: [],
          options: [],
        });
      }).not.toThrow();

      expect(function() {
        taskYargsInstance.register('blank', {
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
    var taskYargsInstance = taskYargs();
    it('Should reject registrations without params', function(done) {
      expect(function() {
        taskYargsInstance.register(undefined, {});
      }).toThrow('Must specify a task name');
      expect(function() {
        taskYargsInstance.register('', {});
      }).toThrow('Must specify a task name');
      expect(function() {
        taskYargsInstance.register('blank', undefined);
      }).toThrow('Must specify task object');
      expect(function() {
        taskYargsInstance.register('blank', 'notAnObject');
      }).toThrow('Must specify task object');
      done();
    });

    it('Should reject badly formed task details', function(done) {
      expect(function() {
        taskYargsInstance.register('noDescrioption', {
          description: undefined,
          prerequisiteTasks: [],
          checks: [],
          options: [],
        });
      }).toThrow('Task must specify a description');
      done();
      expect(function() {
        taskYargsInstance.register('noPrerequisites', {
          description: 'A task without prerequisites',
          prerequisiteTasks: undefined,
          checks: [],
          options: [],
        });
      }).toThrow('Task must specify prerequisite tasks list');
      done();
      expect(function() {
        taskYargsInstance.register('malformedPrerequisites', {
          description: 'A task with malformed prerequisites',
          prerequisiteTasks: ['ok', 123],
          checks: [],
          options: [],
        });
      }).toThrow('Prerequisite task #1 is not a string');
      done();
      expect(function() {
        taskYargsInstance.register('noChecks', {
          description: 'A task without checks',
          prerequisiteTasks: [],
          checks: undefined,
          options: [],
        });
      }).toThrow('Task must specify checks list');
      done();
      expect(function() {
        taskYargsInstance.register('malformedChecks', {
          description: 'A task with malformed checks',
          prerequisiteTasks: [],
          checks: [function() {}, 123],
          options: [],
        });
      }).toThrow('Check #1 is badly formed');
      done();
      expect(function() {
        taskYargsInstance.register('noOptions', {
          description: 'A task attempting to overwrite an existing task',
          prerequisiteTasks: [],
          checks: [],
          options: undefined,
        });
      }).toThrow('Task must specify options list');
      done();
      expect(function() {
        taskYargsInstance.register('malformedOptions', {
          description: 'A task attempting to overwrite an existing task',
          prerequisiteTasks: [],
          checks: [],
          options: [{ key: 'flag', value: {} }, 123],
        });
      }).toThrow('Option #1 is badly formed');
      done();
    });
  });

  describe('[subcommand]', function() {
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('blank', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [],
      options: [],
    });
    var exception;
    var yargsInstance;

    it('Should ensure exactly one', function(done) {
      expect(function() {
        yargsInstance = taskYargsInstance.get('blank', []);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).toThrow('Error: No task defined');

      expect(function() {
        yargsInstance = taskYargsInstance.get('blank', ['blank', 'differentTask']);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).toThrow('Error: More than one task defined');

      done();
    });

    it('Should ensure matches', function(done) {
      expect(function() {
        yargsInstance = taskYargsInstance.get('blank', ['differentTask']);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).toThrow('Error: Wrong task invoked: differentTask instead of blank');

      expect(function() {
        yargsInstance = taskYargsInstance.get('blank', ['blank']);
        yargsInstance.exitProcess(false);
        yargsInstance.argv;
      }).not.toThrow();

      done();
    });
  });
});
