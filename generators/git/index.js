'use strict';
var generators = require('yeoman-generator');
var originUrl = require('git-remote-origin-url');

module.exports = generators.Base.extend({
    constructor: function () {
      generators.Base.apply(this, arguments);

      this.option('generateInto', {
          type: String, required: false, defaults: '', desc: 'Relocate the location of the generated files.'
        }
      );

      this.option('name', {
          type: String, required: true, desc: 'Module name'
        }
      );

      this.option('github-account', {
          type: String, required: true, desc: 'GitHub username or organization'
        }
      );
    },

    initializing: function () {
      this.fs.copy(this.templatePath('gitattributes'), this.destinationPath(this.options.generateInto, '.gitattributes')
      );

      this.fs.copy(this.templatePath('gitignore'), this.destinationPath(this.options.generateInto, '.gitignore')
      );

      return originUrl(this.destinationPath(this.options.generateInto))
        .then(function (url) {
            this.originUrl = url;
          }.bind(this), function () {
            this.originUrl = '';
          }.bind(this)
        );
    },

    writing: function () {
      this.pkg = this.fs.readJSON(this.destinationPath(this.options.generateInto, 'package.json'), {});

      var repository = '';
      if (this.originUrl) {
        repository = this.originUrl;
      } else {
        repository = this.options.githubAccount + '/' + this.options.name;
      }

      this.pkg.repository = this.pkg.repository || repository;

      this.fs.writeJSON(this.destinationPath(this.options.generateInto, 'package.json'), this.pkg);
    },

    end: function () {
      var options = {
        cwd: this.destinationPath(this.options.generateInto)
      };

      this.spawnCommandSync('git', ['init'], options);

      if (!this.originUrl) {
        var repoSSH = this.pkg.repository;
        var shouldCreateRepo = () => {
          return this.options.createGithubRepository && this.spawnCommandSync('which', ['hub'], options) !== '';
        };

        if (this.pkg.repository && this.pkg.repository.indexOf('.git') === -1) {
          repoSSH = 'git@github.com:' + this.pkg.repository + '.git';
        }

        this.spawnCommandSync('git', ['remote', 'add', 'origin', repoSSH], options);
        if (shouldCreateRepo()) {
          this.spawnCommandSync('hub', ['create', '-d', this.pkg.description, '-h', this.pkg.homepage, this.pkg.name], options);
          this.spawnCommandSync('git', ['add', '-A'], options);
          this.spawnCommandSync('git', ['commit', '-m', 'initial'], options);
          this.spawnCommandSync('git', ['push', '--set-upstream', 'origin', 'master'], options);
        }

      }
    }
  }
);
