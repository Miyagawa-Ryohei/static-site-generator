import { app, BrowserWindow, ipcMain } from 'electron';
import loadDevtool from 'electron-load-devtool';

import path from 'path';
import * as fs from "fs";
import * as os from "os";
import Mustache from "mustache";
import * as NodeStatic from "node-static"
import * as http from "http";
import {IPC_RENDERER_EVENTS} from "../model/events";

export class PanelViewerHandler {
    static setup() {

    }
    static close(){
        ipcMain.removeAllListeners('copy-file')
        ipcMain.removeAllListeners('apply-preview')
        ipcMain.removeAllListeners('generate_html')
        ipcMain.removeAllListeners('get-fbf-dir')
        ipcMain.removeAllListeners('read-file')
        ipcMain.removeAllListeners('write-file')
        ipcMain.removeAllListeners('copy-file')
    }
}

