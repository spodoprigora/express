module.exports = function(grunt){
  const plugins = [
    'grunt-cafe-mocha',
    'grunt-contrib-jshint',
    'grunt-exec',
  ];
  plugins.forEach((task) => {
    grunt.loadNpmTasks(task);
  });

  grunt.initConfig({
    cafemocha: {
      all: { src: 'qa/tests-*.js', options: { ui: 'tdd' } },
    },
    jshint: {
      app: ['app.js', 'public/js/**/*.js', 'lib/**/*.js'],
      qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
    },
    exec: {
      linkchecker: { cmd: 'linkchecker http://localhost:3000' },
    },
  });

  // register tasks
  grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
};
