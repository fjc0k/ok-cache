/**
 * Created by 方剑成 on 2017/2/17.
 */

const rollupMakeBundles = require('rollup-make-bundles');

const pkg = require('../package.json');

const root = require('path').join(__dirname, '..') + '/';

const banner =
  '/*!\n' +
  ` * ${pkg.name} v${pkg.version} \n` +
  ` * (c) ${new Date().getFullYear()} ${pkg.author}\n` +
  ` * Released under the ${pkg.license} License.\n` +
  ' */';

const moduleName = 'OkCache';

const baseConfig = {
  entry: root + 'src/index.js',
  banner,
  moduleName,
  presetPlugins: true
};

rollupMakeBundles.easy(baseConfig, {
  dest: root + 'dist',
  name: pkg.name
});