import { app, BrowserWindow, ipcMain } from 'electron';
import loadDevtool from 'electron-load-devtool';
import path from 'path';
import * as fs from "fs";
import * as os from "os";
import * as NodeStatic from "node-static"
import * as http from "http";
import {PanelViewerHandler} from "./proceedures/gateway/panel-viewer";
import {CommonHandler} from "./proceedures/gateway/common";
import {ProjectConfigProvider} from "./proceedures/entity/entity";

var files = new NodeStatic.Server(path.join(os.homedir(),".fbf","data","public"));

const getResourceDirectory = () => {
    return process.env.NODE_ENV === 'development'
        ? path.join(process.cwd(), 'dist')
        : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

const createAppDataDirectory = () => {
    fs.mkdirSync(path.join(os.homedir(),".fbf","template"),{recursive : true});
    fs.mkdirSync(path.join(os.homedir(),".fbf","data"),{recursive : true});
}

var server : any = null;
const createWindow = () => {

    createAppDataDirectory();
    server = http.createServer(function (request, response) {
        request.addListener('end', function () {
            files.serve(request, response);
        }).resume();
    }).listen(3000)
    const config = ProjectConfigProvider.getConfig()
    config.setProject(path.join(os.homedir(),".fbf"))
    CommonHandler.setup()
    PanelViewerHandler.setup()

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.resolve(getResourceDirectory(), 'preload.js'),
        },
    });

    // レンダラープロセスをロード
    mainWindow.loadFile('dist/index.html');

    // 開発時にはデベロッパーツールを開く
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools({ mode: 'detach' });

        // React Developer Tools をロードする
        loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
    }
};

app.whenReady().then(createWindow);

// すべてのウィンドウが閉じられたらアプリを終了する
app.once('window-all-closed', () => {
    if(server) {
        server.close();
    }
    CommonHandler.close()
    PanelViewerHandler.close()
    app.quit()
})