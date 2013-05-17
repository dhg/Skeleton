module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // CSS
    sass: {
        dist: {
            files: {
                'css/skeleton.css': 'scss/skeleton.scss',
            }
        }
    },
    csslint: {
      scssoutput: {
        options: {
          import: false
        },
        src: ['css/skeleton.css']
      }
    },
    cssmin: {
      compress: {
        options: {
          banner: '/* <%= pkg.name %> <%= pkg.version %>  <%= grunt.template.today("dd-mm-yyyy") %> */'
        },
        files: {
          'css/skeleton.min.css': 'css/skeleton.css'
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
  
  grunt.registerTask('lint', ['sass', 'csslint']);
  grunt.registerTask('minify', ['cssmin']);
  grunt.registerTask('build', ['sass', 'cssmin']);

};