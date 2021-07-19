const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".css", ".scss"],
        mainFields: ["main", "module", "browser"],
    },
    entry: "./react/app.tsx",
    target: "electron-renderer",
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            // {
            //     test: /\.css$/i,
            //     use: ["style-loader", "css-loader"],
            // },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "@teamsupercell/typings-for-css-modules-loader",
                    {
                        loader: "css-loader",
                        options: { modules: true },
                    },
                ],
            },
        ],
    },
    devServer: {
        contentBase: path.join(__dirname, "../dist/renderer"),
        historyApiFallback: true,
        compress: true,
        hot: true,
        port: 4000,
        publicPath: "/",
    },
    output: {
        path: path.resolve(__dirname, "../dist/renderer"),
        filename: "js/[name].js",
        publicPath: "./",
    },
    plugins: [new HtmlWebpackPlugin()],
};
