import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

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
            filename: "main.mjs",
            library: { type: "module" }
        },
        experiments: { outputModule: true },
        resolve: { extensions: [".ts", ".js"] },
        module: {
            rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }]
        }
    },
    {
        // ✅ Preload Script (Bridge Between Renderer and Main)
        target: "electron-preload",
        mode: "development",
        entry: "./src/main/preload.ts",
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
