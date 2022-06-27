const path = require('path');
const webpack = require('webpack');
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
        fallback: { 
            "buffer": require.resolve('buffer/'),
        }
    },
    mode: 'development',
    plugins: [
    
        // CRITICAL: Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        }),
    ]
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