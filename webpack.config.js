const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

/** エディタで補完を効かせるために型定義をインポート */
/** @type import('webpack').Configuration */
const baseConfig = {
    // 共通設定
    mode: isDev ? 'development' : 'production',
    resolve: {
        modules: ["node_modules"],
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    // バンドルファイルの出力先（ここではプロジェクト直下の 'dist' ディレクトリ）
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            /**
             * 拡張子 '.ts' または '.tsx' （正規表現）のファイルを 'ts-loader' で処理
             * node_modules ディレクトリは除外する
             */
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
            /**
             * CSSファイルは 'css-loader' でJSへバンドルし、
             * 'style-loader' で <link> タグに展開する
             * use配列に指定したローダーは *後ろから* 順に適用される
             */
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            /**
             * 画像ファイルは 'url-loader' でJSへバンドルする
             */
            {
                test: /\.(bmp|ico|gif|jpe?g|png|svg|ttf|eot|woff?2?)$/,
                loader: 'url-loader',
            },
        ],
    },
    /**
     * developmentモードではソースマップを付ける
     *
     * レンダラープロセスでは development モード時に
     * ソースマップがないと electron のデベロッパーコンソールに
     * 'Uncaught EvalError' が表示されてしまうことに注意
     */
    devtool: isDev ? 'inline-source-map' : false,
};

/** メインプロセス用設定 */
/** @type import('webpack').Configuration */
const main = {
    // 共通設定を読み込み
    ...baseConfig,
    target: 'electron-main',
    entry: {
        main: './src/main.ts',
    },
};

/** preload スクリプト用設定（後述） */
/** @type import('webpack').Configuration */
const preload = {
    ...baseConfig,
    target: 'electron-preload',
    entry: {
        preload: './src/preload.ts',
    },
};

/** レンダラープロセス用設定 */
/** @type import('webpack').Configuration */
const renderer = {
    ...baseConfig,
    target: 'electron-renderer',
    entry: {
        renderer: './src/renderer.tsx',
    },
    plugins: [
        /**
         * バンドルしたJSファイルを <script></script> タグとして差し込んだ
         * HTMLファイルを出力するプラグイン
         */
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
    ],
};

/**
 * メイン，プリロード，レンダラーそれぞれの設定を
 * 配列に入れてエクスポート
 */
module.exports = [main, preload, renderer];