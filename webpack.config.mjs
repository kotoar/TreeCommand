import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
    {
        // ✅ Electron Main Process
        target: "electron-main",
        mode: "development",
        entry: "./src/main/main.ts",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "main.cjs",
            library: { type: "commonjs2" }
        },
        externals: {
            "fs": "commonjs2 fs",
            "path": "commonjs2 path",
            "electron": "commonjs2 electron",
            'better-sqlite3': 'commonjs better-sqlite3',
        },
        experiments: { outputModule: false },
        resolve: { extensions: [".ts", ".js"] },
        module: {
            rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }]
        },
        plugins: [
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'src/main/database/database.sql'),
                        to: path.resolve(__dirname, 'dist/static/schema.sql'),
                        noErrorOnMissing: true,
                    },
                    {
                        from: path.resolve(__dirname, 'src/static'),
                        to: path.resolve(__dirname, 'dist/static'),
                        noErrorOnMissing: false,
                    }
                ],
            }),
        ],
    },
    {
        // ✅ Preload Script (Bridge Between Renderer and Main)
        target: "electron-preload",
        mode: "development",
        entry: "./src/preload/preload.ts",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "preload.js"
        },
        resolve: { extensions: [".ts", ".js"] },
        module: {
            rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }]
        }
    },
    {
        // ✅ React Renderer Process
        target: "web",
        mode: "development",
        entry: "./src/renderer/index.tsx",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "renderer.js"
        },
        resolve: { extensions: [".ts", ".tsx", ".js"] },
        module: {
            rules: [{ test: /\.(ts|tsx)$/, use: "ts-loader", exclude: /node_modules/ }]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/renderer/index.html"
            })
        ],
        devServer: {
            static: "./dist",
            hot: true
        }
    }
];
