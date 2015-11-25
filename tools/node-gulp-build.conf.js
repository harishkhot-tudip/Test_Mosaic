module.exports = function RJSConfig() {
  return {
    mainConfigFile: './requirejs.conf.js',
    paths: {
      jquery: 'lib/jquery/jquery.min',
      almond: 'lib/almond/almond'
    },
    baseUrl: './',
    name: "mosaic-component",
    include: [
      'almond',
      'css!dist/styles/main'
    ],
    buildCSS: true,
    stubModules: ['text', 'hgn', 'json'],
    out: "./dist/scripts/mosaic-component.min.js",
    pragmasOnSave: {
      excludeHogan: true,
      excludeRequireCss: true
    },
    cjsTranslate: true,
    optimize: "uglify2",
    preserveLicenseComments: false,
    uglify2: {
      compress: {
        unsafe: true,
        drop_debugger: true
      },
      mangle: true
    },
    wrap: {
      startFile: './tools/wrap-start.frag',
      endFile: './tools/wrap-end.frag'
    },
    generateSourceMaps: true,
    onBuildRead: function(moduleName, path, contents) {
      switch (moduleName) {
        case "jquery":
          contents = "define([], function(require, exports, module) {" + contents + "});";
      }
      return contents;
    }
  };
};