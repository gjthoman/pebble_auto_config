var ReplacePlugin = require('replace-webpack-plugin');

module.exports = {
  plugins: [
    new ReplacePlugin({
      entry: './index.html',
      output: './_index.html',
      data: {
        css: '<link rel="stylesheet" href="main.css">',
        js: '<script src="main.js"></script>',
        hidden: ''
      }
    })
  ]
};