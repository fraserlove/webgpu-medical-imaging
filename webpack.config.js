const path = require('path');

module.exports = {
    entry: './static/src/ts/main.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'static/dist'),
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(wgsl|vs|fs)$/,
                loader: 'ts-shader-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.ts']
    },
}