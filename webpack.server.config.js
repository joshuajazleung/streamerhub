const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const StartServerPlugin = require('start-server-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        server: ['webpack/hot/poll?1000', './src/index.js']
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
        publicPath: '/'
    },
    watch: true,
    mode: 'development',
    target: 'node',
    externals: [
        nodeExternals({
            whitelist: ['webpack/hot/poll?1000']
        })
    ],
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false, // if you don't put this is, __dirname
        __filename: false // and __filename return blank or /
    },
    module: {
        rules: [
            {
                // Transpiles ES6-8 into ES5
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new StartServerPlugin({
            name: 'server.js',
            nodeArgs: ['-r', 'dotenv/config']
        }),
        new webpack.HotModuleReplacementPlugin()
        // new CleanWebpackPlugin(['./dist']),
    ]
};
