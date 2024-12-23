const path = require('path');

module.exports = {
	entry: path.resolve(__dirname, 'src/index-build.ts'),
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: 'ts-loader',
					options: {
						context: __dirname,
						configFile: path.resolve(__dirname, 'tsconfig-cjs.json'),
					}
				},
				exclude: /node_modules/
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		modules: [
			path.resolve(__dirname, 'node_modules'),
			path.resolve(__dirname, './'),
		],
		fallback: {
			buffer: require.resolve('buffer/'),
			crypto: require.resolve('crypto-browserify'),
			stream: require.resolve('stream-browserify'),
			vm: require.resolve('vm-browserify'),
		},
	},
	output: {
		filename: 'daisycon-bundle.min.js',
		path: path.resolve(__dirname, 'lib/build'),
		library: "daisycon"
	},
};
