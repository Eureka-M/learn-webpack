const path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /\.txt$/i,
                use: ["aLoader", "bLoader", "cLoader"]
            },
        ],
    },
    resolveLoader: {
        modules: [
            path.resolve(__dirname, "node_modules"),
            path.resolve(__dirname, "loaders")
        ]
    }
}