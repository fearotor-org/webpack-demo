let path = require('path'),
    webpack = require('webpack'),
    merge = require('webpack-merge'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),

    commonConfig = require('./webpack.config.common.js'),

    {HtmlOrderCommonScriptPlugin} = require('./webpack.myPlugin.js');

/**
 * 生产环境Webpack打包配置，整合公共部分
 * @type {[type]}
 */
module.exports = merge(commonConfig, {
    // 生产环境不开启sourceMap
    devtool: false,

    // 文件输出配置
    output: {
        // 设置文件引用主路径
        publicPath: '/'
    },

    // 模块的处理配置，匹配规则对应文件，使用相应loader配置成可识别的模块
    module: {
        rules: [{
            test: /\.(png|gif|jpg)$/,
            use: {
                loader: 'url-loader',
                // 处理图片，当大小在范围之内时，图片转换成Base64编码，否则将使用file-loader引入
                options: {
                    limit: 8192,
                    // 设置生成图片的路径名字信息 [path]相对context，outputPath输出的路径，publicPath相应引用的路径
                    name: '[name].[ext]?[hash:8]',
                    outputPath: './images/',
                    publicPath: '/images/',
                }
                /*文件名冲突时用此方案  下面字体图标同理
                options: {
                    limit: 8192,
                    // 设置生成图片的路径名字信息 [path]相对context，outputPath输出的路径，publicPath相应引用的路径
                    name: '[path][name].[ext]?[hash:8]',
                    outputPath: './',
                    publicPath: '/',
                }
                */
            }
        }, {
            test: /\.(eot|svg|ttf|otf|woff|woff2)\w*/,
            use: [{
                loader: 'file-loader',
                options: {
                    // 设置生成字体文件的路径名字信息 [path]相对context，outputPath输出的路径，publicPath相应引用的主路径
                    name: '[name].[ext]?[hash:8]',
                    outputPath: './fonts/',
                    publicPath: '/fonts/',
                    // 使用文件的相对路径，这里先不用这种方式
                    // useRelativePath: isProduction
                }
            }],
        }]
    },

    // 插件配置
    plugins: [
        // 清理生成的文件目录
        //new CleanWebpackPlugin([path.resolve(__dirname, 'dist')]),
        new CleanWebpackPlugin([
            path.resolve(__dirname, 'dist/css'),
            path.resolve(__dirname, 'dist/fonts'),
            path.resolve(__dirname, 'dist/images'),
            path.resolve(__dirname, 'dist/js'),
            path.resolve(__dirname, 'dist/html')
        ]),

        // 压缩代码
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        // 设置编译文件页面文件资源模块的引入
        new HtmlWebpackPlugin({
            // 模版源文件
            template: '../views/templates/index.html',
            // 编译后的目标文件
            filename: './html/index.html',
            // 要处理的模块文件
            chunks: ['common', 'index'],
            // 插入到<body>标签底部
            inject: true
        }),
        new HtmlWebpackPlugin({
            template: '../views/templates/login.html',
            filename: './html/login.html',
            chunks: ['common', 'login'],
            inject: true
        }),
        // HtmlWebpackPlugin 运行后调整公共script文件在html中的位置，主要用于jQuery插件的引入
        new HtmlOrderCommonScriptPlugin({
            // commonName: 'vendor'
        })
    ]
});
