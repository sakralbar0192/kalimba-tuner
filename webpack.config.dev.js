const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',    
    entry: './src/index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                'style-loader',
                {
                    loader: "css-loader",
                    options: {
                        sourceMap: true,
                        modules: {
                            auto: true,
                            localIdentName: "[local]_[hash]",
                        },
                    },
                },
                {
                    loader: "sass-loader",
                    options: {
                        sourceMap: true,
                    },
                },
                ],
            },
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Developing...',
        })
    ],
    devServer: {
        static: './dist',
        compress: true,
        port: 9000,
    },
    devtool: 'inline-source-map',
};