'use strict';
var generators = require('yeoman-generator');
var _ = require('lodash');
var extend = _.merge;
var packageJson = require('./packages/package');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);

    this.option('generateInto', {
      type: String,
      required: false,
      defaults: '',
      desc: 'Relocate the location of the generated files.'
    });

    this.option('es2015', {
      required: false,
      defaults: false,
      desc: 'Allow ES2015 syntax'
    });
  },

  writing: function () {
    var pkg = this.fs.readJSON(this.destinationPath(this.options.generateInto, 'package.json'), {});
    var devDep;
    var eslintConfig = {
      extends: 'xo-space',
      env: {
        mocha: true
      }
    };



    extend(pkg, {
      devDependencies:_.pick(packageJson.devDependencies,
      [ 'eslint',
        'eslint-config-xo',
        'eslint-config-xo-space'])
    });
    devDep = pkg.devDependencies;

    if (this.options.es2015) {
      devDep['babel-eslint'] = '^6.1.2';
      devDep['eslint-plugin-babel'] = '^3.3.0';
    }

    extend(pkg, {
      devDependencies: devDep,
      eslintConfig: eslintConfig
    });

    this.fs.writeJSON(this.destinationPath(this.options.generateInto, 'package.json'), pkg);
  }
});
