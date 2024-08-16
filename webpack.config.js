const path = require("path");
const webpack = require("webpack");

const webpackConfig = {
    target: "web",
    node:{
        global: true
    },
    mode: "development",
    optimization: {
        minimize: false
    },
    devtool: "inline-source-map",
    context: __dirname,
    entry: {
        app: [
            "@babel/polyfill",
            path.resolve(__dirname, "./client/index.js")
        ]
    },
    module: {
        rules: [
            { test: /\.js$/, use:[{loader: "babel-loader"}], exclude: /node_modules/ },
            { test: /\.css$/, use:[{loader: "css-loader"}] },
            { test: /\.scss$/, use:[{loader: "css-loader"}, {loader: "sass-loader"}] },
            { test: /\.(png|jpg|gif|svg)$/, use:[{loader: "file-loader"}] },
            { test: /\.(ttf|woff|woff2|eot)$/, use:[{loader: "url-loader"}] }
        ]
    },
    resolve: {
        alias: {
            "@utilities": path.resolve(__dirname, "./client/utilities"),
            "@components": path.resolve(__dirname, "./client/components"),
            "@assets": path.resolve(__dirname, "./client/assets"),
            "@env": path.resolve(__dirname, "env.json")
        },
        extensions: [".js", ".ts"],
    },
    output: {
        filename: "js/appbundle.js",
        path: path.resolve(__dirname, "dist")
    },
    stats: "verbose",
    plugins: [
        new webpack.DefinePlugin({
          __isBrowser__: "true"
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
};

module.exports = webpackConfig;