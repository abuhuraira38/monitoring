const path = require("path");

module.exports = {
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    },
    output: {
        libraryTarget: "commonjs",
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
    },
    target: "node",
    externals: ["aws-sdk"],
    module: {
        rules: [{ test: /\.tsx?$/, loader: "ts-loader" }],
    },
};
