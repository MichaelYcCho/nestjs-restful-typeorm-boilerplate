const nodeExternals = require('webpack-node-externals'); // eslint-disable-line
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin'); // eslint-disable-line

// Require statement not part of import statement.eslint@typescript-eslint/no-var-requires
module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: options.output.filename,
        autoRestart: false,
      }),
    ],
  };
};
