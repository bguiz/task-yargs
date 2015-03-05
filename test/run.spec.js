'use strict';

var taskYargsRun = require('../run');

describe('[run]', function() {
  describe('[simple]', function() {
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
  });

  describe('[with onInit]', function() {
    it('Should run onInit on self', function(done) {
      var onInitHasRun, onRunHasRun;
      var tyRunInstance = taskYargsRun();
      tyRunInstance.taskYargs.register('blank', {
        description: 'A blank task with an onInit function',
        prerequisiteTasks: [],
        checks: [],
        options: [],
        onInit: function() {
          onInitHasRun = true;
        },
        onRun: function() {
          onRunHasRun = true;
        },
      });

      onInitHasRun = false;
      onRunHasRun = false;
      tyRunInstance.byName('blank');
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
          onRunFatherHasRun = true;
        },
      });
      onInitChildHasRun = false;
      onInitFatherHasRun = false;
      onRunChildHasRun = false;
      onRunFatherHasRun = false;
      tyRunInstance.byName('father');
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
});
