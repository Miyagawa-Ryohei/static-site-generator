import { app, BrowserWindow, ipcMain } from 'electron';
import loadDevtool from 'electron-load-devtool';

import path from 'path';
import * as fs from "fs";
import * as os from "os";
import Mustache from "mustache";
import * as NodeStatic from "node-static"
import * as http from "http";
import {IPC_RENDERER_EVENTS} from "../model/events";
import {ExportProjectParam, ReadFileParam, WriteFileParam} from "../model/ipcmodel";
import {AddPageParam, getEmptyParam, HTMLPageParams, HTMLPageTypes, HTMLView} from "../model/htmlparams";
import {ProjectConfigProvider} from "../entity/entity";
import archiver from "archiver";

export class CommonHandler {
    static setup(){
        ipcMain.on(IPC_RENDERER_EVENTS.LOAD_APPLICATION_CONFIG, (e, arg) => {
            try {
                const dataDir = path.join(ProjectConfigProvider.getConfig().getProjectName());
                const sep = path.sep;
                e.reply(IPC_RENDERER_EVENTS.LOAD_APPLICATION_CONFIG_REPLY,{pathSep : sep,dataDir : dataDir});
            } catch(err) {
                e.reply(IPC_RENDERER_EVENTS.LOAD_APPLICATION_CONFIG_REPLY,{error : err});
            }
        });

        ipcMain.on(IPC_RENDERER_EVENTS.LOAD_ALL_CONFIG, (e, arg) => {
            try {
                e.reply(IPC_RENDERER_EVENTS.LOAD_ALL_CONFIG_REPLY, loadAllConfig());
            } catch (err) {
                e.reply(IPC_RENDERER_EVENTS.LOAD_ALL_CONFIG_REPLY, {error: err});
            }
        });

        ipcMain.on(IPC_RENDERER_EVENTS.LOAD_HTML_CONFIG, (e, arg) => {
            try {
                const data = fs.readFileSync(path.join( ProjectConfigProvider.getConfig().getProjectName(), ProjectConfigProvider.getConfig().getProjectDir(), "project.json"));
                e.reply(IPC_RENDERER_EVENTS.LOAD_HTML_CONFIG_REPLY, JSON.parse(data.toString()));
            } catch (err) {
                e.reply(IPC_RENDERER_EVENTS.LOAD_HTML_CONFIG_REPLY, {error: err});
            }
        });

        ipcMain.on(IPC_RENDERER_EVENTS.EXPORT_PROJECT, (e, arg : ExportProjectParam) => {
            try {
                const destDir = path.dirname(arg.dest)
                fs.mkdirSync(path.join(
                    destDir,
                ), {recursive: true});

                const output = fs.createWriteStream(
                    path.join(
                        arg.dest
                    )
                );
                const outputArchive = archiver("zip");
                outputArchive.directory(path.join(
                    ProjectConfigProvider.getConfig().getProjectName(),
                    ProjectConfigProvider.getConfig().getProjectDir(),
                    "public",
                ),"")
                outputArchive.pipe(output);
                outputArchive.finalize();
                output.on("close", function () {
                    // zip圧縮完了すると発火する
                    var archive_size = outputArchive.pointer();
                    e.reply(IPC_RENDERER_EVENTS.EXPORT_PROJECT_REPLY);
                });
                output.on("error",  (err) => {
                    // zip圧縮完了すると発火する
                    e.reply(IPC_RENDERER_EVENTS.EXPORT_PROJECT_REPLY,err);
                });
            } catch(err) {
                e.reply(IPC_RENDERER_EVENTS.EXPORT_PROJECT_REPLY,err);
            }
        });

        ipcMain.on(IPC_RENDERER_EVENTS.APPLY_PREVIEW, (e, arg:HTMLPageParams) => {
            try {
                const menu = Mustache.render(fs.readFileSync(path.join(ProjectConfigProvider.getConfig().getProjectName(),"template","menu.mustache")).toString(),{menu:arg.common.menu});
                const header = Mustache.render(fs.readFileSync(path.join(ProjectConfigProvider.getConfig().getProjectName(),"template","header.mustache")).toString(),{menu:menu});
                const footer= Mustache.render(fs.readFileSync(path.join(ProjectConfigProvider.getConfig().getProjectName(),"template","footer.mustache")).toString(),{});
                arg.pages.map(page => {
                    var templateName = page.type+".mustache"
                    const html = Mustache.render(fs.readFileSync(path.join(ProjectConfigProvider.getConfig().getProjectName(),"template",templateName)).toString(),page.param);
                    fs.writeFileSync(path.join(ProjectConfigProvider.getConfig().getProjectName(),ProjectConfigProvider.getConfig().getProjectDir(),"public",page.param.pageName+".html"), header+html+footer);
                })
                e.reply(IPC_RENDERER_EVENTS.APPLY_PREVIEW_REPLY);
            } catch(err) {
                e.reply(IPC_RENDERER_EVENTS.APPLY_PREVIEW_REPLY,err);
            }
        });

        ipcMain.on(IPC_RENDERER_EVENTS.READ_FILE,(e,arg : ReadFileParam) => {
            try {
                const data = fs.readFileSync(arg.path,arg.option)
                e.reply(IPC_RENDERER_EVENTS.READ_FILE_REPLY, data);
            } catch(err) {
                e.reply(IPC_RENDERER_EVENTS.READ_FILE_REPLY, err);
            }
        })

        ipcMain.on(IPC_RENDERER_EVENTS.CREATE_NEW_PAGE,(e,arg : HTMLView) => {
            try {
                const raw = fs.readFileSync(path.join(ProjectConfigProvider.getConfig().getProjectName(),ProjectConfigProvider.getConfig().getProjectDir(),arg.type+".json")).toString()
                const jsons = JSON.parse(raw)
                jsons.push(arg.param)
                fs.writeFileSync(path.join(ProjectConfigProvider.getConfig().getProjectName(),ProjectConfigProvider.getConfig().getProjectDir(),arg.type+".json"), JSON.stringify(jsons,null,2))
                e.reply(IPC_RENDERER_EVENTS.CREATE_NEW_PAGE_REPLY);
                e.reply(IPC_RENDERER_EVENTS.LOAD_ALL_CONFIG_REPLY, loadAllConfig());
            } catch(err) {
                e.reply(IPC_RENDERER_EVENTS.CREATE_NEW_PAGE_REPLY, err);
            }
        })

        ipcMain.on(IPC_RENDERER_EVENTS.WRITE_FILE,(e,arg : WriteFileParam) => {
            try {
                fs.writeFileSync(arg.path, arg.data, arg.option)
                e.reply(IPC_RENDERER_EVENTS.WRITE_FILE_REPLY);
            } catch(err) {
                e.reply(IPC_RENDERER_EVENTS.WRITE_FILE_REPLY, err);
            }
        })

        ipcMain.on(IPC_RENDERER_EVENTS.COPY_FILE,(e,arg) => {
            try {
                fs.copyFileSync(arg.src, arg.dest)
                e.reply(IPC_RENDERER_EVENTS.COPY_FILE_REPLY);
            } catch(err) {
                e.reply(IPC_RENDERER_EVENTS.COPY_FILE_REPLY, err);
            }
        })
    }

    static close(){
        ipcMain.removeAllListeners(IPC_RENDERER_EVENTS.COPY_FILE)
        ipcMain.removeAllListeners(IPC_RENDERER_EVENTS.WRITE_FILE)
        ipcMain.removeAllListeners(IPC_RENDERER_EVENTS.READ_FILE)
        ipcMain.removeAllListeners(IPC_RENDERER_EVENTS.LOAD_APPLICATION_CONFIG)
        ipcMain.removeAllListeners(IPC_RENDERER_EVENTS.EXPORT_PROJECT)
        ipcMain.removeAllListeners(IPC_RENDERER_EVENTS.COPY_FILE_REPLY)
    }
}

const loadAllConfig = () => {
    const common = JSON.parse(
        fs.readFileSync(
            path.join(
                ProjectConfigProvider.getConfig().getProjectName(),
                ProjectConfigProvider.getConfig().getProjectDir(),
                `project.json`)
        ).toString()
    );
    const panel = JSON.parse(
        fs.readFileSync(
            path.join(
                ProjectConfigProvider.getConfig().getProjectName(),
                ProjectConfigProvider.getConfig().getProjectDir(),
                `${HTMLPageTypes.PANEL_VIEW}.json`)
        ).toString()
    );
    const document = JSON.parse(
        fs.readFileSync(
            path.join(
                ProjectConfigProvider.getConfig().getProjectName(),
                ProjectConfigProvider.getConfig().getProjectDir(),
                `${HTMLPageTypes.DOCUMENT_VIEW}.json`)
        ).toString()
    );
    const access = JSON.parse(
        fs.readFileSync(
            path.join(
                ProjectConfigProvider.getConfig().getProjectName(),
                ProjectConfigProvider.getConfig().getProjectDir(),
                `${HTMLPageTypes.ACCESS_VIEW}.json`)
        ).toString()
    );
    const schedule = JSON.parse(
        fs.readFileSync(
            path.join(
                ProjectConfigProvider.getConfig().getProjectName(),
                ProjectConfigProvider.getConfig().getProjectDir(),
                `${HTMLPageTypes.SCHEDULE_VIEW}.json`)
        ).toString()
    );
    return {
        common,
        panel,
        document,
        access,
        schedule
    }
}