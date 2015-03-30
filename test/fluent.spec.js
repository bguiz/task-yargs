'use strict';

var taskYargsFluent = require('../fluent');
var helper = require('./helper');

describe('[fluent]', function() {
  describe('[interface]', function() {
    var tyFluentInstance = taskYargsFluent();

    it('Should construct a valid object', function(done) {
      var definition, definition2;
      expect(function() {
        definition = tyFluentInstance
          .create('name')
          .describe('description')
          .prerequisite(['foo', 'bar'])
          .prerequisite('baz')
          .hidden()
          .option('woo')
          .option(['woo', 'woo'])
          .check('hoo')
          .check(['hoo', 'hoo'])
          .definition;
        //NOTE invalid option and check included to explicitly check that
        // validation is deferred until the fluent interface is terminated (via register)
      }).not.toThrow();

      expect(definition).toEqual({
        name: 'name',
        description: 'description',
        prerequisiteTasks: ['foo', 'bar', 'baz'],
        options: ['woo', 'woo', 'woo'],
        checks: ['hoo', 'hoo', 'hoo'],
        hidden: true,
        onInit: undefined,
        onRun: undefined,
      });

      expect(function() {
        definition2 = tyFluentInstance
          .create('name2')
          .describe('description2')
          .hidden(false)
          .definition;
      }).not.toThrow();

      expect(definition2).toEqual({
        name: 'name2',
        description: 'description2',
        prerequisiteTasks: [],
        options: [],
        checks: [],
        hidden: false,
        onInit: undefined,
        onRun: undefined,
      });

      done();
    });
  });

  describe('[basic]', function() {
    it('Should register a task', function(done) {
      var tyFluentInstance = taskYargsFluent();
      tyFluentInstance.create('blank')
        .describe('A blank task')
        .register();
      var yargsInstance = tyFluentInstance.taskYargs.get('blank', ['blank']);
      var argv = yargsInstance.argv;
      expect(argv._).toEqual(['blank']);
      done();
    });

    it('Should register a task with prerequisites', function(done) {
      var tyFluentInstance = taskYargsFluent();
      tyFluentInstance.create('child')
        .describe('Child task')
        .register();
      tyFluentInstance.create('father')
        .describe('Father task')
        .prerequisite('child')
        .register();

      var yargsInstance = tyFluentInstance.taskYargs.get('child', ['child']);
      var argv = yargsInstance.argv;
      expect(argv._).toEqual(['child']);

      yargsInstance = tyFluentInstance.taskYargs.get('father', ['father']);
      argv = yargsInstance.argv;
      expect(argv._).toEqual(['father']);

      done();
    });

    it('Should register a task with options', function(done) {
      var tyFluentInstance = taskYargsFluent();
      tyFluentInstance.create('blank')
        .describe('A blank task')
        .option(helper.optionFoo)
        .register();

      var yargsInstance = tyFluentInstance.taskYargs.get('blank', ['blank']);
      var argv = yargsInstance.argv;
      expect(argv._).toEqual(['blank']);
      expect(argv.foo).toEqual('meh');

      yargsInstance = tyFluentInstance.taskYargs.get('blank', ['blank', '--foo', 'bar']);
      argv = yargsInstance.argv;
      expect(argv._).toEqual(['blank']);
      expect(argv.foo).toEqual('bar');

      done();
    });
  });
});
