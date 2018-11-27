const path = require('path');

module.exports = {
    outputDir: path.resolve(__dirname, '../server/public'),
    pluginOptions: {
        webpackBundleAnalyzer: {
            openAnalyzer: false
        }
    }
};
