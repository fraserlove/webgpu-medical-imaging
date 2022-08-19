const path = require('path');
const nodeExternals = require('webpack-node-externals');

const common = {
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(wgsl|glsl|vs|fs)$/,
                loader: 'ts-shader-loader'
            },
            {
                test: /\.css$/i,                                                                                                                                                             
                use: ["style-loader", "css-loader"]                                                                                                                      
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    mode: 'development'
}

const frontend = {
    entry: './frontend/src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'frontend/dist'),
    },
}

const backend = {
    entry: './backend/main.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'backend/build'),
    },
    target: 'node',
    externals: [nodeExternals()],
}

module.exports = [
    Object.assign({} , common, frontend),
    Object.assign({} , common, backend)
];