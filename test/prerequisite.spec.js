'use strict';

var yargs = require('yargs');
var taskYargs = require('../index');
var helper = require('./helper');

describe('[register with prerequisite]', function() {
  describe('[basic]', function() {
    it('Should resolve single', function(done) {
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
      var fatherYargsDefinition = taskYargsInstance.getDefinition('father', ['father']);
      expect(fatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['child']);
      done();
    });
    it('Should resolve multiple levels', function(done) {
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
      var grandFatherYargsDefinition = taskYargsInstance.getDefinition('grandfather', ['grandfather']);
      expect(grandFatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['father', 'child']);
      var fatherYargsDefinition = taskYargsInstance.getDefinition('father', ['father']);
      expect(fatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['child']);
      done();
    });
    it('Should resolve multiple siblings', function(done) {
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
      var grandFatherYargsDefinition = taskYargsInstance.getDefinition('grandfather', ['grandfather']);
      expect(grandFatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['father', 'child', 'sister', 'mother']);
      var fatherYargsDefinition = taskYargsInstance.getDefinition('father', ['father']);
      expect(fatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['child', 'sister']);
      done();
    });
  });

  describe('[checks and options]', function() {
    it('Should register basic', function() {
      var taskYargsInstance = taskYargs();
      taskYargsInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      var fooYargsInstance = taskYargsInstance.get('blank', ['blank', '--foo', 'bar']);
      expect(fooYargsInstance.argv.foo).toEqual('bar');
      //test alias too
      expect(fooYargsInstance.argv.f).toEqual('bar');
    });
    it('Should register with default', function() {
      var taskYargsInstance = taskYargs();
      taskYargsInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      var fooYargsInstance = taskYargsInstance.get('blank', ['blank']);
      expect(fooYargsInstance.argv.foo).toEqual('meh');
      //test alias too
      expect(fooYargsInstance.argv.f).toEqual('meh');
    });
    it('Should register without default', function(done) {
      var taskYargsInstance = taskYargs();
      taskYargsInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp, helper.checkMustHaveJojoUnlessHelp],
        options: [helper.optionFoo, helper.optionJojo],
      });
      done();
    });
  });

  describe('[inherit checks and options]', function() {
    it('Should inherit from single', function() {
      var taskYargsInstance = taskYargs();
      var taskYargsInstance = taskYargs();
      taskYargsInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      taskYargsInstance.register('father', {
        description: 'A blank task',
        prerequisiteTasks: ['child'],
        checks: [],
        options: [],
      });
      var fatherYargsInstance = taskYargsInstance.get('father', ['father', '--foo', 'bar']);
      expect(fatherYargsInstance.argv.foo).toEqual('bar');
      //test alias too
      expect(fatherYargsInstance.argv.f).toEqual('bar');
    });
    it('Should inherit from single with default', function() {
      var taskYargsInstance = taskYargs();
      var taskYargsInstance = taskYargs();
      taskYargsInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      taskYargsInstance.register('father', {
        description: 'A blank task',
        prerequisiteTasks: ['child'],
        checks: [],
        options: [],
      });
      var fatherYargsInstance = taskYargsInstance.get('father', ['father']);
      expect(fatherYargsInstance.argv.foo).toEqual('meh');
      //test alias too
      expect(fatherYargsInstance.argv.f).toEqual('meh');
    });
    it('Should inherit from multiple levels', function() {
      var taskYargsInstance = taskYargs();
      var taskYargsInstance = taskYargs();
      taskYargsInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
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
      var grandFatherYargsInstance = taskYargsInstance.get('grandfather', ['grandfather']);
      expect(grandFatherYargsInstance.argv.foo).toEqual('meh');
      //test alias too
      expect(grandFatherYargsInstance.argv.f).toEqual('meh');
    });
    it('Should inherit from multiple siblings', function() {
      var taskYargsInstance = taskYargs();
      taskYargsInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
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
      var grandFatherYargsInstance = taskYargsInstance.get('grandfather', ['grandfather']);
      expect(grandFatherYargsInstance.argv.foo).toEqual('meh');
      //test alias too
      expect(grandFatherYargsInstance.argv.f).toEqual('meh');
      var fatherYargsInstance = taskYargsInstance.get('father', ['father', '-f', 'bar']);
      expect(fatherYargsInstance.argv.foo).toEqual('bar');
      //test alias too
      expect(fatherYargsInstance.argv.f).toEqual('bar');
    });
  });
});
