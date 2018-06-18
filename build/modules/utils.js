const path = require('path');
const config = require('../../config');

// Load webpack plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');




// Resolve path
// Starting from root by default
const resolve = function (dir) {
    return path.join(__dirname, '../..', dir)
};


// Get assets path
const assetsPath = function (_path) {
    const assetsSubDirectory = process.env.NODE_ENV === 'production'
        ? config.build.assetsSubDirectory
        : config.dev.assetsSubDirectory;
    return path.posix.join(assetsSubDirectory, _path)
};


// Create css loaders
exports.cssLoaders = function (options) {
    options = options || {};

    const cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: process.env.NODE_ENV === 'production',
            sourceMap: options.sourceMap
        }
    };

    const postcssLoader = {
        loader: 'postcss-loader',
        options: {sourceMap: options.sourceMap || false}
    };


    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {

        let loaders = [cssLoader];
        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            })
        }

        // Extract
        // CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            return ExtractTextPlugin.extract({
                use: loaders,
                fallback: 'vue-style-loader'
            })
        } else {
            loaders.push(postcssLoader);
            return ['vue-style-loader'].concat(loaders)
        }
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', {indentedSyntax: true}),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus'),

    }
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
    let output = [];
    const loaders = exports.cssLoaders(options);
    for (let extension in loaders) {
        const loader = loaders[extension];
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loader
        })
    }
    return output
};


exports.resolve = resolve;
exports.assetsPath = assetsPath;
