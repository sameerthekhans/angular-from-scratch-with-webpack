const path = require('path');
const sass = require('sass');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const TerserPlugin = require('terser-webpack-plugin');


module.exports = (env) => {
    const isDevelopment = env.WEBPACK_SERVE || false;
    const sassOptions = [
        {
            loader: 'css-loader',
            options: {
                esModule: false
            }
        },
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        [
                            "postcss-preset-env",
                            {
                                autoprefixer: {
                                    grid: true
                                }
                            },
                        ]
                    ],
                },
            },
        },
        {
            loader: 'sass-loader',
            options: { implementation: sass }
        }
    ];

    const config = {
        mode: isDevelopment ? 'development' : 'production',
        resolve: {
            extensions: ['.ts', '.js']
        },
        entry: {
            main: './src/main',
            styles: './src/styles.scss'
        },
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: '[name].[fullhash].bundle.js',
            chunkFilename: '[id].[fullhash].chunk.js'
        },
        module: {
            rules: [
                {
                    test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                    loader: '@ngtools/webpack'
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader',
                    exclude: path.resolve('./src/index.html')
                },
                {
                    test: /\.scss$/,
                    use: [
                        'to-string-loader',
                        ...sassOptions
                    ],
                    exclude: /styles\.scss/
                },
                {
                    test: /styles\.scss/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        ...sassOptions
                    ]
                }
            ]
        },
        optimization: {
            minimizer: [
                `...`,
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true,
                            drop_debugger: true
                        }
                    }
                })
            ],
        },
        plugins: [
            new MiniCssExtractPlugin(),
            new HtmlWebpackPlugin({
                template: './src/index.html',
                chunks: ['main', 'styles'],
                chunksSortMode: 'manual',
                inject: 'body',
                base: '/'
            }),
            new AngularCompilerPlugin({
                tsConfigPath: path.resolve('tsconfig.json'),
                mainPath: './src/main.ts',
                compilerOptions: {
                    strictTemplates: true,
                    enableIvy: false
                },
                hostReplacementPaths: {
                    './src/environments/environment.ts':
                        isDevelopment ?
                            './src/environments/environment.ts' :
                            './src/environments/environment.prod.ts'
                }
            })
        ]
    }

    if (isDevelopment) {
        config.output.filename = '[name].bundle.js';
        config.output.chunkFilename = '[id].bundle.js';
        config.target = 'web';
        config.devtool = 'eval-source-map';
        config.stats = {
            preset: 'minimal'
        };
        config.devServer = {
            open: true,
            overlay: true,
            hot: true,
            liveReload: false,
            writeToDisk: env.writeToDisk,
        };
        config.optimization = { runtimeChunk: 'single' };
        /**Config for styles.scss */
        config.module.rules[3].use.splice(0, 1, 'style-loader');
    }
    return config;
}