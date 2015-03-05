'use strict';

var yargs = require('yargs');
var taskYargs = require('../index');
var helper = require('./helper');

describe('[current]', function() {
  describe('[name]', function() {
    it('Should identify the current task name', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      var taskName;
      taskName = tyInstance
        .getCurrentName(['node', 'my-process', 'blank']);
      expect(taskName).toEqual('blank');
      taskName = tyInstance
        .getCurrentName(['node', 'my-process', 'blank', '--foo', 'bar']);
      expect(taskName).toEqual('blank');
      taskName = tyInstance
        .getCurrentName(['node', 'my-process', 'wrongTask', '--foo', 'bar']);
      expect(taskName).toBeUndefined();
      done();
    });
  });
  describe('[task]', function() {
    it('Should retrieve the current task', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [{
          key: 'foo',
          value: {
            string: true,
            default: 'meh'
          }
        }],
      });
      var task, argv;
      task = tyInstance
        .getCurrent(['node', 'my-process', 'blank']);
      argv = task.argv;
      expect(argv.foo).toEqual('meh');
      task = tyInstance
        .getCurrent(['node', 'my-process', 'blank', '--foo', 'bar']);
      argv = task.argv;
      expect(argv.foo).toEqual('bar');
      task = tyInstance
        .getCurrent(['node', 'my-process', 'wrongTask', '--foo', 'bar']);
      expect(task).toBeUndefined();
      done();
    });
  });
});
