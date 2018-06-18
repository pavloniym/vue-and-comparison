const path = require('path');
const utils = require('./../utils');
const config = require('../../../config');

const webpack = require('webpack');
const baseWebpackConfig = require('./base');
const merge = require('webpack-merge');


// Load webpack plugins
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


// Set env
const env = process.env.NODE_ENV === 'testing' ? require('../config/test.env') : config.build.env;

let webpackConfig = merge(baseWebpackConfig, {

    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.sourceMap,
            extract: true
        })
    },

    devtool: config.build.sourceMap ? '#source-map' : false,

    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
    },

    plugins: [

        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        new webpack.DefinePlugin({
            'process.env': env
        }),

        new UglifyJsPlugin({
            parallel: true,
            sourceMap: true,
            uglifyOptions: {
                ecma: 8,
                compress: {warnings: false},
            },
        }),

        // extract css into its own file
        new ExtractTextPlugin({
            filename: utils.assetsPath('css/[name].[contenthash].css')
        }),

        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
            cssProcessorOptions: {safe: true}
        }),

        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: process.env.NODE_ENV === 'testing'
                ? 'index.html'
                : config.build.index,
            template: 'index.html',
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),

        // keep module.id stable when vender modules does not change
        new webpack.HashedModuleIdsPlugin(),

        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module, count) {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                )
            }
        }),

        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vendor']
        }),

        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: utils.resolve('static'),
                to: config.build.assetsSubDirectory,
                ignore: ['.*']
            }
        ]),

    ]
});


if (config.build.obfuscation) {

    const JavaScriptObfuscator = require('webpack-obfuscator');
    const ignores = (config.build.obfuscationIgnore || []).map(i => utils.assetsPath(i));

    console.log('> Obfuscation is ENABLED');

    //https://github.com/javascript-obfuscator/javascript-obfuscator
    webpackConfig.plugins.push(
        new JavaScriptObfuscator({
            compact: true,
            controlFlowFlattening: false,
            deadCodeInjection: false,
            debugProtection: false,
            debugProtectionInterval: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            renameGlobals: false,
            rotateStringArray: true,
            selfDefending: true,
            stringArray: true,
            stringArrayEncoding: false,
            stringArrayThreshold: 0.75,
            unicodeEscapeSequence: false
        }, ignores)
    )
}


if (config.build.gzip) {

    const CompressionWebpackPlugin = require('compression-webpack-plugin');
    const extensions = config.build.gzipExtensions.join('|');

    console.log('> Gzip is ENABLED');

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp('\\.(' + extensions + ')$'),
            threshold: 10240,
            minRatio: 0.8
        })
    )
}

if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig;
