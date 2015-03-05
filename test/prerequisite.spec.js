'use strict';

var yargs = require('yargs');
var taskYargs = require('../index');
var helper = require('./helper');

describe('[register with prerequisite]', function() {
  describe('[basic]', function() {
    it('Should resolve single', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      tyInstance.register('father', {
        description: 'A blank task',
        prerequisiteTasks: ['child'],
        checks: [],
        options: [],
      });
      var fatherYargsDefinition = tyInstance.getDefinition('father', ['father']);
      expect(fatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['child']);
      done();
    });
    it('Should resolve multiple levels', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      tyInstance.register('father', {
        description: 'A blank task',
        prerequisiteTasks: ['child'],
        checks: [],
        options: [],
      });
      tyInstance.register('grandfather', {
        description: 'A blank task',
        prerequisiteTasks: ['father'],
        checks: [],
        options: [],
      });
      var grandFatherYargsDefinition = tyInstance.getDefinition('grandfather', ['grandfather']);
      expect(grandFatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['father', 'child']);
      var fatherYargsDefinition = tyInstance.getDefinition('father', ['father']);
      expect(fatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['child']);
      done();
    });
    it('Should resolve multiple siblings', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      tyInstance.register('sister', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      tyInstance.register('father', {
        description: 'A blank task',
        prerequisiteTasks: ['child', 'sister'],
        checks: [],
        options: [],
      });
      tyInstance.register('mother', {
        description: 'A blank task',
        prerequisiteTasks: ['child', 'sister'],
        checks: [],
        options: [],
      });
      tyInstance.register('grandfather', {
        description: 'A blank task',
        prerequisiteTasks: ['father', 'mother'],
        checks: [],
        options: [],
      });
      var grandFatherYargsDefinition = tyInstance.getDefinition('grandfather', ['grandfather']);
      expect(grandFatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['father', 'child', 'sister', 'mother']);
      var fatherYargsDefinition = tyInstance.getDefinition('father', ['father']);
      expect(fatherYargsDefinition.resolvedPrerequisiteTasks).toEqual(['child', 'sister']);
      done();
    });
  });

  describe('[checks and options]', function() {
    it('Should register basic', function() {
      var tyInstance = taskYargs();
      tyInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      var fooYargsInstance = tyInstance.get('blank', ['blank', '--foo', 'bar']);
      expect(fooYargsInstance.argv.foo).toEqual('bar');
      //test alias too
      expect(fooYargsInstance.argv.f).toEqual('bar');
    });
    it('Should register with default', function() {
      var tyInstance = taskYargs();
      tyInstance.register('blank', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      var fooYargsInstance = tyInstance.get('blank', ['blank']);
      expect(fooYargsInstance.argv.foo).toEqual('meh');
      //test alias too
      expect(fooYargsInstance.argv.f).toEqual('meh');
    });
    it('Should register without default', function(done) {
      var tyInstance = taskYargs();
      tyInstance.register('blank', {
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
      var tyInstance = taskYargs();
      var tyInstance = taskYargs();
      tyInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      tyInstance.register('father', {
        description: 'A blank task',
        prerequisiteTasks: ['child'],
        checks: [],
        options: [],
      });
      var fatherYargsInstance = tyInstance.get('father', ['father', '--foo', 'bar']);
      expect(fatherYargsInstance.argv.foo).toEqual('bar');
      //test alias too
      expect(fatherYargsInstance.argv.f).toEqual('bar');
    });
    it('Should inherit from single with default', function() {
      var tyInstance = taskYargs();
      var tyInstance = taskYargs();
      tyInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      tyInstance.register('father', {
        description: 'A blank task',
        prerequisiteTasks: ['child'],
        checks: [],
        options: [],
      });
      var fatherYargsInstance = tyInstance.get('father', ['father']);
      expect(fatherYargsInstance.argv.foo).toEqual('meh');
      //test alias too
      expect(fatherYargsInstance.argv.f).toEqual('meh');
    });
    it('Should inherit from multiple levels', function() {
      var tyInstance = taskYargs();
      var tyInstance = taskYargs();
      tyInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      tyInstance.register('father', {
        description: 'A blank task',
        prerequisiteTasks: ['child'],
        checks: [],
        options: [],
      });
      tyInstance.register('grandfather', {
        description: 'A blank task',
        prerequisiteTasks: ['father'],
        checks: [],
        options: [],
      });
      var grandFatherYargsInstance = tyInstance.get('grandfather', ['grandfather']);
      expect(grandFatherYargsInstance.argv.foo).toEqual('meh');
      //test alias too
      expect(grandFatherYargsInstance.argv.f).toEqual('meh');
    });
    it('Should inherit from multiple siblings', function() {
      var tyInstance = taskYargs();
      tyInstance.register('child', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [helper.checkMustHaveFooUnlessHelp],
        options: [helper.optionFoo],
      });
      tyInstance.register('sister', {
        description: 'A blank task',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });
      tyInstance.register('father', {
        description: 'A blank task',
        prerequisiteTasks: ['child', 'sister'],
        checks: [],
        options: [],
      });
      tyInstance.register('mother', {
        description: 'A blank task',
        prerequisiteTasks: ['child', 'sister'],
        checks: [],
        options: [],
      });
      tyInstance.register('grandfather', {
        description: 'A blank task',
        prerequisiteTasks: ['father', 'mother'],
        checks: [],
        options: [],
      });
      var grandFatherYargsInstance = tyInstance.get('grandfather', ['grandfather']);
      expect(grandFatherYargsInstance.argv.foo).toEqual('meh');
      //test alias too
      expect(grandFatherYargsInstance.argv.f).toEqual('meh');
      var fatherYargsInstance = tyInstance.get('father', ['father', '-f', 'bar']);
      expect(fatherYargsInstance.argv.foo).toEqual('bar');
      //test alias too
      expect(fatherYargsInstance.argv.f).toEqual('bar');
    });
  });
});
