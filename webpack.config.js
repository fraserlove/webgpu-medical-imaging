const path = require('path');

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
        path: path.resolve(__dirname, 'backend/static'),
    },
}

module.exports = [
    Object.assign({} , common, frontend)
];