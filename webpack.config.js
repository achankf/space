const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

// ignore ts-loader for now, since it causes errors with wasm imports

module.exports = {
    entry: "./build/bootstrap.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    devtool: "sourcemap",
    mode: "development",
    plugins: [
        new CopyWebpackPlugin(['index.html'])
    ]
};