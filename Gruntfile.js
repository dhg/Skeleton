module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // CSS
    sass: {
        dist: {
            files: {
                'css/Ribs.css': 'scss/Ribs.scss',
            }
        }
    },
    csslint: {
      scssoutput: {
        options: {
          import: false,
          csslintrc: '.csslintrc'
        },
        src: ['css/Ribs.css']
      }
    },
    cssmin: {
      compress: {
        options: {
          banner: '/* <%= pkg.name %> <%= pkg.version %> - https://github.com/nickpack/Ribs - <%= grunt.template.today("dd-mm-yyyy") %> */'
        },
        files: {
          'css/Ribs.min.css': 'css/Ribs.css'
        }
      },
    },
    watch: {
      files: 'scss/**/*',
      tasks: ['sass', 'csslint', 'cssmin']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.registerTask('test', ['sass', 'csslint']);
  grunt.registerTask('minify', ['cssmin']);
  grunt.registerTask('default', ['sass', 'cssmin']);

};