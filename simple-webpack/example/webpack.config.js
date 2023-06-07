const path = require("path")
module.exports = {
    mode: "development",
    entry: {
        main: path.resolve(__dirname, "./src/entry1.js")
    },
    devtool: false,
    output: {
        path: path.resolve(__dirname, "./build"),
        filename: "[name].js"
    },
    resolve: {
        extensions: [".js", ".ts"]
    },
    module: {
        rules: [
            {
                test: /\.js/,
                use: [
                    path.resolve(__dirname, "../loaders/loader-1.js"),
                    path.resolve(__dirname, "../loaders/loader-2.js")
                ]
            }
        ]
    }
}
