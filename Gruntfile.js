module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // CSS
    sass: {
        dist: {
            files: {
                'build/css/Ribs.css': 'src/scss/Ribs.scss',
            }
        }
    },
    csslint: {
      scssoutput: {
        options: {
          import: false,
          csslintrc: '.csslintrc'
        },
        src: ['build/css/Ribs.css']
      },
      brutal: {
        src: ['build/css/Ribs.css']
      }
    },
    cssmin: {
      compress: {
        options: {
          banner: '/* <%= pkg.name %> <%= pkg.version %> - https://github.com/nickpack/Ribs - <%= grunt.template.today("dd-mm-yyyy") %> */'
        },
        files: {
          'build/css/Ribs.min.css': 'build/css/Ribs.css'
        }
      },
    },
    watch: {
      files: 'src/scss/**/*',
      tasks: ['sass', 'csslint:scssoutput', 'cssmin']
    },
    styleguide: {
        styledocco: {
            options: {
                framework: {
                    name: 'styledocco'
                },
                name: '<%= pkg.name %>'
            },
            template: {
              include: 'build/css/Ribs.min.css'
            },
            files: {
                'docs': 'src/scss/*.scss'
            },
        }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-styleguide');

  grunt.registerTask('docs', ['sass', 'styleguide']);
  grunt.registerTask('test', ['sass', 'csslint:scssoutput']);
  grunt.registerTask('minify', ['cssmin']);
  grunt.registerTask('default', ['sass', 'cssmin']);

};
