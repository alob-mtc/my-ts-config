/* eslint-disable global-require, @typescript-eslint/no-var-requires, @typescript-eslint/explicit-function-return-type */
const path = require('path');
const { di } = require('@wessberg/di-compiler');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

function pathResolve(..._paths) {
  return path.resolve(__dirname, ..._paths);
}

const config = {
  source: 'src',
  dest: 'dist',
};

module.exports = (env = {}) => {
  const _config = {
    entry: [pathResolve(config.source, 'index.ts')],
    target: 'node',
    // devtool alternatives: cheap-module-eval-source-map (faster, less details) or cheap-eval-source-map (fastest, even less details)
    devtool: env.development ? 'inline-source-map' : false,
    node: {
      // Need this when working with express, otherwise the build fails
      __dirname: false, // if you don't put this is, __dirname
      __filename: false, // and __filename return blank or /
    },
    output: {
      path: pathResolve(config.dest),
      filename: 'index.js',
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    plugins: [new CleanWebpackPlugin()],
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              options: {
                reportFiles: [`${config.source}/**/*.ts`],
                getCustomTransformers: (program) => di({ program }),
              },
              loader: 'ts-loader',
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
    },
  };

  if (env.nodemon) {
    _config.watch = true;
    _config.plugins.push(new NodemonPlugin());
  }

  return _config;
};
