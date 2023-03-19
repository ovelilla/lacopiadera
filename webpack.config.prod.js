const path = require("path");

module.exports = [
    {
        mode: "production",
        entry: "./src/js/app.js",
        output: {
            path: __dirname + "/public/build/js",
            filename: "app.js",
        },
        devServer: {
            contentBase: path.join(__dirname, "public/build/js"),
        },
        experiments: {
            topLevelAwait: true,
        },
    },
];
