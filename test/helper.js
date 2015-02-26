'use strict';

function checkMustHaveFooUnlessHelp(argv) {
  if (argv.help) {
    return true;
  }
  else if (argv.foo === 'illegalValue') {
    throw new Error('Illegal value for foo');
  }
  else if (typeof argv.foo === 'undefined') {
    throw new Error('Missing argument for foo')
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

function checkMustHaveJojoUnlessHelp(argv) {
  if (argv.help) {
    return true;
  }
  else if (argv.jojo == 'illegalValue') {
    throw new Error('Illegal value for jojo');
  }
  else if (typeof argv.jojo === 'undefined') {
    throw new Error('Missing argument for jojo');
  }
  else {
    return true;
  }
}

var optionJojo = {
  key: 'jojo',
  value: {
    describe: 'A description of the jojo option',
    alias: ['j', 'jo'],
    // default is *not* specified
    string: true,
  },
};

module.exports = {
  checkMustHaveFooUnlessHelp: checkMustHaveFooUnlessHelp,
  optionFoo: optionFoo,
  checkMustHaveJojoUnlessHelp: checkMustHaveJojoUnlessHelp,
  optionJojo: optionJojo,
};
