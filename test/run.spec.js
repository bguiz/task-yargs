'use strict';

var helper = require('./helper');
var taskYargsRun = require('../run');

describe('[run]', function() {
  describe('[instance specified]', function() {
    it('Should be able to instantiate a task yargs run instance with a specified task yargs instance', function(done) {
      var tyInstance = require('../index')();
      expect(function() {
        var tyRunInstance = taskYargsRun(tyInstance);
      }).not.toThrow();
      done();
    });
  });

  describe('[with onRun]', function() {
    describe('[object]', function() {
      var onRunHasRun;
      var tyRunInstance = taskYargsRun();
      tyRunInstance.taskYargs.register('blank', {
        description: 'A blank task with an onRun function',
        prerequisiteTasks: [],
        checks: [],
        options: [],
        onRun: function() {
          onRunHasRun = true;
        },
      });

      tyRunInstance.taskYargs.register('norun', {
        description: 'A blank task without an onRun function',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });

      it('Should run a task\'s onRun function (named)', function(done) {
        onRunHasRun = false;
        tyRunInstance.byName('blank');
        expect(onRunHasRun).toEqual(true);
        done();
      });

      it('Should run a task\'s onRun function (current)', function(done) {
        onRunHasRun = false;
        tyRunInstance.current(undefined, ['node', 'my-process', 'blank']);
        expect(onRunHasRun).toEqual(true);
        done();
      });

      it('Should fail to run a task that does not define an onRun function (current)', function(done) {
        onRunHasRun = false;
        expect(function() {
          tyRunInstance.current(undefined, ['node', 'my-process', 'norun']);
        }).toThrowError('Task definition for "norun" does not define an onRun function, and no default was provided');
        expect(onRunHasRun).toEqual(false);
        done();
      });

      it('Should fail to run a task that does not define an onRun function (by name)', function(done) {
        onRunHasRun = false;
        expect(function() {
          tyRunInstance.byName('norun', undefined, ['node', 'my-process', 'norun']);
        }).toThrowError('Task definition for "norun" does not define an onRun function, and no default was provided');
        expect(onRunHasRun).toEqual(false);
        done();
      });

      it('Should show help for a task that does not define an onRun function (current)', function(done) {
        onRunHasRun = false;
        expect(function() {
          tyRunInstance.current(undefined, ['node', 'my-process', 'norun', '--help']);
        }).not.toThrow();
        expect(onRunHasRun).toEqual(false);
        done();
      });

      it('Should fail to run a task that is not defined (current)', function(done) {
        onRunHasRun = false;
        expect(function() {
          tyRunInstance.current(undefined, ['node', 'my-process', 'foobar']);
        }).not.toThrow();
        expect(onRunHasRun).toEqual(false);
        done();
      });

      it('Should fail to run a task that is not defined (by name)', function(done) {
        onRunHasRun = false;
        expect(function() {
          tyRunInstance.current('foobar', undefined, ['node', 'my-process', 'foobar']);
        }).not.toThrow();
        expect(onRunHasRun).toEqual(false);
        done();
      });

      it('Should fail to run a task when no name specified (current)', function(done) {
        onRunHasRun = false;
        expect(function() {
          tyRunInstance.current(undefined, ['node', 'my-process']);
        }).not.toThrow();
        expect(onRunHasRun).toEqual(false);
        done();
      });

      it('Should fail to run a task when no name specified (byName)', function(done) {
        onRunHasRun = false;
        expect(function() {
          tyRunInstance.byName('foobar', undefined, ['node', 'my-process']);
        }).toThrowError('No task registered with name foobar');
        expect(onRunHasRun).toEqual(false);
        done();
      });
    });

    describe('[fluent]', function() {
      var onRunHasRun;
      var tyRunInstance = taskYargsRun();
      tyRunInstance.fluent
        .create('blank')
        .describe('A blank task')
        .onRun(function() {
          onRunHasRun = true;
        })
        .register();

      it('Should run a tasks\'s onRun function (named)', function(done) {
        onRunHasRun = false;
        tyRunInstance.byName('blank');
        expect(onRunHasRun).toEqual(true);
        done();
      });

      it('Should run a tasks\'s onRun function (current)', function(done) {
        onRunHasRun = false;
        tyRunInstance.current(undefined, ['node', 'my-process', 'blank']);
        expect(onRunHasRun).toEqual(true);
        done();
      });
    });

    describe('[custom onRun]', function() {
      var onRunHasRun;
      function customOnRun() {
        onRunHasRun = true;
      };
      var tyRunInstance = taskYargsRun();
      tyRunInstance.taskYargs.register('blank', {
        description: 'A blank task with an onRun function',
        prerequisiteTasks: [],
        checks: [],
        options: [],
      });

      it('Should run a task (by name) with a custom onRun function', function(done) {
        onRunHasRun = false;
        tyRunInstance.byName('blank', customOnRun, ['node', 'my-process', 'blank']);
        expect(onRunHasRun).toEqual(true);
        done();
      });

      it('Should run a task (current) with a custom onRun function', function(done) {
        onRunHasRun = false;
        tyRunInstance.current(customOnRun, ['node', 'my-process', 'blank']);
        expect(onRunHasRun).toEqual(true);
        done();
      });
    });
  });

  describe('[with onInit]', function() {
    describe('[object]', function() {
      it('Should run onInit on self', function(done) {
        var onInitHasRun, onRunHasRun;
        var tyRunInstance = taskYargsRun();
        tyRunInstance.taskYargs.register('blank', {
          description: 'A blank task with an onInit function',
          prerequisiteTasks: [],
          checks: [helper.checkMustHaveFooUnlessHelp],
          options: [helper.optionFoo],
          onInit: function(yargsInstance) {
            onInitHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.foo).toEqual('bar');
            }).not.toThrow();
          },
          onRun: function(yargsInstance) {
            onRunHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.foo).toEqual('bar');
            }).not.toThrow();
          },
        });

        onInitHasRun = false;
        onRunHasRun = false;
        tyRunInstance.byName('blank', undefined,
          ['node', 'my-process', 'blank', '--foo', 'bar']);
        expect(onInitHasRun).toEqual(true);
        expect(onRunHasRun).toEqual(true);
        done();
      });

      it('Should run onInit on prerequisite tasks and self', function(done) {
        var onInitChildHasRun, onInitFatherHasRun;
        var onRunChildHasRun, onRunFatherHasRun;
        var tyRunInstance = taskYargsRun();
        tyRunInstance.taskYargs.register('child', {
          description: 'A child task with an onInit function',
          prerequisiteTasks: [],
          checks: [helper.checkMustHaveJojoUnlessHelp],
          options: [helper.optionJojo],
          onInit: function(yargsInstance) {
            onInitChildHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.jojo).toEqual('momo');
            }).not.toThrow();
          },
          onRun: function(yargsInstance) {
            onRunChildHasRun = true;
            // Not expecting this function to get invoked
          },
        });
        tyRunInstance.taskYargs.register('father', {
          description: 'A father task with an onInit function',
          prerequisiteTasks: ['child'],
          checks: [helper.checkMustHaveFooUnlessHelp],
          options: [helper.optionFoo],
          onInit: function(yargsInstance) {
            onInitFatherHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.foo).toEqual('bar');
            }).not.toThrow();
          },
          onRun: function(yargsInstance) {
            onRunFatherHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.foo).toEqual('bar');
            }).not.toThrow();
          },
        });
        onInitChildHasRun = false;
        onInitFatherHasRun = false;
        onRunChildHasRun = false;
        onRunFatherHasRun = false;
        tyRunInstance.byName('father', undefined,
          ['node', 'my-process', 'father', '--foo', 'bar', '--jojo', 'momo']);
        expect(onInitFatherHasRun).toEqual(true);
        expect(onInitChildHasRun).toEqual(true);
        expect(onRunFatherHasRun).toEqual(true);
        expect(onRunChildHasRun).toEqual(false);
        done();
      });

      it('Should run onInit on multiple levels of prerequisite tasks and self', function(done) {
        var onInitChildHasRun, onInitFatherHasRun, onInitGrandfatherHasRun;
        var onRunChildHasRun, onRunFatherHasRun, onRunGrandfatherHasRun;
        var tyRunInstance = taskYargsRun();
        tyRunInstance.taskYargs.register('child', {
          description: 'A child task with an onInit function',
          prerequisiteTasks: [],
          checks: [],
          options: [],
          onInit: function() {
            onInitChildHasRun = true;
          },
          onRun: function() {
            onRunChildHasRun = true;
          },
        });
        tyRunInstance.taskYargs.register('father', {
          description: 'A father task with an onInit function',
          prerequisiteTasks: ['child'],
          checks: [],
          options: [],
          onInit: function() {
            onInitFatherHasRun = true;
          },
          onRun: function() {
            onInitFatherHasRun = true;
          },
        });
        tyRunInstance.taskYargs.register('grandfather', {
          description: 'A grandfather task with an onInit function',
          prerequisiteTasks: ['father'],
          checks: [],
          options: [],
          onInit: function() {
            onInitGrandfatherHasRun = true;
          },
          onRun: function() {
            onRunGrandfatherHasRun = true;
          },
        });
        onInitChildHasRun = false;
        onInitFatherHasRun = false;
        onInitGrandfatherHasRun = false;
        onRunChildHasRun = false;
        onRunFatherHasRun = false;
        onRunGrandfatherHasRun = false;
        tyRunInstance.byName('grandfather');
        expect(onInitGrandfatherHasRun).toEqual(true);
        expect(onInitFatherHasRun).toEqual(true);
        expect(onInitChildHasRun).toEqual(true);
        expect(onRunGrandfatherHasRun).toEqual(true);
        expect(onRunFatherHasRun).toEqual(false);
        expect(onRunChildHasRun).toEqual(false);
        done();
      });
    });

    describe('[fluent]', function() {
      it('Should run onInit on self', function(done) {
        var onInitHasRun, onRunHasRun;
        var tyRunInstance = taskYargsRun();
        tyRunInstance.fluent
          .create('blank')
          .describe('A blank task with an onInit function')
          .check(helper.checkMustHaveFooUnlessHelp)
          .option(helper.optionFoo)
          .onInit(function(yargsInstance) {
            onInitHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.foo).toEqual('bar');
            }).not.toThrow();
          })
          .onRun(function(yargsInstance) {
            onRunHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.foo).toEqual('bar');
            }).not.toThrow();
          })
          .register();

        onInitHasRun = false;
        onRunHasRun = false;
        tyRunInstance.byName('blank', undefined,
          ['node', 'my-process', 'blank', '--foo', 'bar']);
        expect(onInitHasRun).toEqual(true);
        expect(onRunHasRun).toEqual(true);
        done();
      });

      it('Should run onInit on prerequisite tasks and self', function(done) {
        var onInitChildHasRun, onInitFatherHasRun;
        var onRunChildHasRun, onRunFatherHasRun;
        var tyRunInstance = taskYargsRun();
        tyRunInstance.fluent
          .create('child')
          .describe('A child task with an onInit function')
          .check(helper.checkMustHaveJojoUnlessHelp)
          .option(helper.optionJojo)
          .onInit(function(yargsInstance) {
            onInitChildHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.jojo).toEqual('momo');
            }).not.toThrow();
          })
          .onRun(function(yargsInstance) {
            onRunChildHasRun = true;
            // Not expecting this function to get invoked
          })
          .register();
        tyRunInstance.fluent
          .create('father')
          .describe('A father task with an onInit function')
          .prerequisite('child')
          .check(helper.checkMustHaveFooUnlessHelp)
          .option(helper.optionFoo)
          .onInit(function(yargsInstance) {
            onInitFatherHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.foo).toEqual('bar');
            }).not.toThrow();
          })
          .onRun(function(yargsInstance) {
            onRunFatherHasRun = true;
            expect(function() {
              var cliArgs = yargsInstance.argv;
              expect(cliArgs.foo).toEqual('bar');
            }).not.toThrow();
          })
          .register();

        onInitChildHasRun = false;
        onInitFatherHasRun = false;
        onRunChildHasRun = false;
        onRunFatherHasRun = false;
        tyRunInstance.byName('father', undefined,
          ['node', 'my-process', 'father', '--foo', 'bar', '--jojo', 'momo']);

        expect(onInitFatherHasRun).toEqual(true);
        expect(onInitChildHasRun).toEqual(true);
        expect(onRunFatherHasRun).toEqual(true);
        expect(onRunChildHasRun).toEqual(false);

        done();
      });

      it('Should run onInit on multiple levels of prerequisite tasks and self', function(done) {
        var onInitChildHasRun, onInitFatherHasRun, onInitGrandfatherHasRun;
        var onRunChildHasRun, onRunFatherHasRun, onRunGrandfatherHasRun;
        var tyRunInstance = taskYargsRun();
        tyRunInstance.fluent
          .create('child')
          .describe('A child task with an onInit function')
          .onInit(function() {
            onInitChildHasRun = true;
          })
          .onRun(function() {
            onRunChildHasRun = true;
          })
          .register();
        tyRunInstance.fluent
          .create('father')
          .describe('A father task with an onInit function')
          .prerequisite('child')
          .onInit(function() {
            onInitFatherHasRun = true;
          })
          .onRun(function() {
            onInitFatherHasRun = true;
          })
          .register();
        tyRunInstance.fluent
          .create('grandfather')
          .describe('A grandfather task with an onInit function')
          .prerequisite('father')
          .onInit(function() {
            onInitGrandfatherHasRun = true;
          })
          .onRun(function() {
            onRunGrandfatherHasRun = true;
          })
          .register();
        onInitChildHasRun = false;
        onInitFatherHasRun = false;
        onInitGrandfatherHasRun = false;
        onRunChildHasRun = false;
        onRunFatherHasRun = false;
        onRunGrandfatherHasRun = false;
        tyRunInstance.byName('grandfather');
        expect(onInitGrandfatherHasRun).toEqual(true);
        expect(onInitFatherHasRun).toEqual(true);
        expect(onInitChildHasRun).toEqual(true);
        expect(onRunGrandfatherHasRun).toEqual(true);
        expect(onRunFatherHasRun).toEqual(false);
        expect(onRunChildHasRun).toEqual(false);
        done();
      });
    });
  });
});
