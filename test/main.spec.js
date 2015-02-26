'use strict';

var yargs = require('yargs');
var taskYargs = require('../index');
var helper = require('./helper');

describe('Register a task without dependencies', function() {
  it('Should register a blank task', function(done) {
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('blank', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [],
      options: [],
    });
    var yargsInstance = taskYargsInstance.get('blank', ['myprocess', 'blank']);
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
    var yargsInstance = taskYargsInstance.get('blank', ['myprocess', 'blank']);
    var exception;
    try {
      taskYargsInstance.register('blank2', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
    }
    catch (ex) {
      exception = ex;
    }
    finally {
      expect(exception && exception.message).toEqual('Not allowed to register new tasks after first task retrieval');
      done();
    }
  });

  //TODO more validation and error checking related tests
});

describe('Register task with prerequisite tasks', function() {
  it('Should resolve prerequisite tasks', function(done) {
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('child', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('father', {
      description: 'A blank task',
      prerequisiteTasks: ['child'],
      checks: [],
      options: [],
    });
    var fatherYargsDefinition = taskYargsInstance.getDefinition('father', ['myprocess', 'father']);
    expect(fatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['child']);
    done();
  });
  it('Should resolve prerequisite tasks - multiple levels', function(done) {
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('child', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('father', {
      description: 'A blank task',
      prerequisiteTasks: ['child'],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('grandfather', {
      description: 'A blank task',
      prerequisiteTasks: ['father'],
      checks: [],
      options: [],
    });
    var grandFatherYargsDefinition = taskYargsInstance.getDefinition('grandfather', ['myprocess', 'grandfather']);
    expect(grandFatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['father', 'child']);
    var fatherYargsDefinition = taskYargsInstance.getDefinition('father', ['myprocess', 'father']);
    expect(fatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['child']);
    done();
  });
  it('Should resolve prerequisite tasks - multiple siblings', function(done) {
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('child', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('sister', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('father', {
      description: 'A blank task',
      prerequisiteTasks: ['child', 'sister'],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('mother', {
      description: 'A blank task',
      prerequisiteTasks: ['child', 'sister'],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('grandfather', {
      description: 'A blank task',
      prerequisiteTasks: ['father', 'mother'],
      checks: [],
      options: [],
    });
    var grandFatherYargsDefinition = taskYargsInstance.getDefinition('grandfather', ['myprocess', 'grandfather']);
    expect(grandFatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['father', 'child', 'sister', 'mother']);
    var fatherYargsDefinition = taskYargsInstance.getDefinition('father', ['myprocess', 'father']);
    expect(fatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['child', 'sister']);
    done();
  });
});

function checkMustHaveFooUnlessHelp(argv) {
  if (argv.help) {
    return;
  }
  else if (argv.foo === 'illegalValue') {
    return 'Illegal value for foo';
  }
  else {
    return true;
  }
}

var optionFoo = {
  key: 'foo',
  value: {
    describe: 'A description of the foo option',
    alias: ['f'],
    default: 'meh',
    string: true,
  },
};

describe('Register task', function() {
  it('Should register a task with a check and option', function() {
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('blank', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [checkMustHaveFooUnlessHelp],
      options: [optionFoo],
    });
    var fooYargsInstance = taskYargsInstance.get('blank', ['myprocess', 'blank', '--foo', 'bar']);
    expect(fooYargsInstance.argv.foo).toEqual('bar');
    //test alias too
    expect(fooYargsInstance.argv.f).toEqual('bar');
  });
  it('Should register a task with a check and option with default', function() {
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('blank', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [checkMustHaveFooUnlessHelp],
      options: [optionFoo],
    });
    var fooYargsInstance = taskYargsInstance.get('blank', ['myprocess', 'blank']);
    expect(fooYargsInstance.argv.foo).toEqual('meh');
    //test alias too
    expect(fooYargsInstance.argv.f).toEqual('meh');
  });
});


describe('Register prerequisite task', function() {
  it('Should inherit check and option from prerequisite', function() {
    var taskYargsInstance = taskYargs();
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('child', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [checkMustHaveFooUnlessHelp],
      options: [optionFoo],
    });
    taskYargsInstance.register('father', {
      description: 'A blank task',
      prerequisiteTasks: ['child'],
      checks: [],
      options: [],
    });
    var fatherYargsInstance = taskYargsInstance.get('father', ['myprocess', 'father', '--foo', 'bar']);
    expect(fatherYargsInstance.argv.foo).toEqual('bar');
    //test alias too
    expect(fatherYargsInstance.argv.f).toEqual('bar');
  });
  it('Should inherit check and option from prerequisite - with default', function() {
    var taskYargsInstance = taskYargs();
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('child', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [checkMustHaveFooUnlessHelp],
      options: [optionFoo],
    });
    taskYargsInstance.register('father', {
      description: 'A blank task',
      prerequisiteTasks: ['child'],
      checks: [],
      options: [],
    });
    var fatherYargsInstance = taskYargsInstance.get('father', ['myprocess', 'father']);
    expect(fatherYargsInstance.argv.foo).toEqual('meh');
    //test alias too
    expect(fatherYargsInstance.argv.f).toEqual('meh');
  });
  it('Should inherit check and option from prerequisite - multiple levels', function() {
    var taskYargsInstance = taskYargs();
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('child', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [checkMustHaveFooUnlessHelp],
      options: [optionFoo],
    });
    taskYargsInstance.register('father', {
      description: 'A blank task',
      prerequisiteTasks: ['child'],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('grandfather', {
      description: 'A blank task',
      prerequisiteTasks: ['father'],
      checks: [],
      options: [],
    });
    var grandFatherYargsInstance = taskYargsInstance.get('grandfather', ['myprocess', 'father']);
    expect(grandFatherYargsInstance.argv.foo).toEqual('meh');
    //test alias too
    expect(grandFatherYargsInstance.argv.f).toEqual('meh');
  });
  it('Should inherit check and option from prerequisite - multiple siblings', function() {
    var taskYargsInstance = taskYargs();
    taskYargsInstance.register('child', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [checkMustHaveFooUnlessHelp],
      options: [optionFoo],
    });
    taskYargsInstance.register('sister', {
      description: 'A blank task',
      prerequisiteTasks: [],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('father', {
      description: 'A blank task',
      prerequisiteTasks: ['child', 'sister'],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('mother', {
      description: 'A blank task',
      prerequisiteTasks: ['child', 'sister'],
      checks: [],
      options: [],
    });
    taskYargsInstance.register('grandfather', {
      description: 'A blank task',
      prerequisiteTasks: ['father', 'mother'],
      checks: [],
      options: [],
    });
    var grandFatherYargsInstance = taskYargsInstance.get('grandfather', ['myprocess', 'father']);
    expect(grandFatherYargsInstance.argv.foo).toEqual('meh');
    //test alias too
    expect(grandFatherYargsInstance.argv.f).toEqual('meh');
    var fatherYargsInstance = taskYargsInstance.get('father', ['myprocess', 'father', '-f', 'bar']);
    expect(fatherYargsInstance.argv.foo).toEqual('bar');
    //test alias too
    expect(fatherYargsInstance.argv.f).toEqual('bar');
  });
});

