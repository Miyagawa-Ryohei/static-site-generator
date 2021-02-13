import {
    CopyFileParam,
    ExportProjectParam,
    ReadFileParam,
    ReadFileResponse,
    WriteFileParam
} from "../../proceedures/model/ipcmodel"
import {HTMLPageParams, CommonConfig, HTMLView} from "../../proceedures/model/htmlparams";
import {ApplicationSetting} from "../../proceedures/model/application-setting";
import {IPC_RENDERER_EVENTS} from "../../proceedures/model/events";

export const loadConfig = async () => {
    return new Promise<ApplicationSetting>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.LOAD_APPLICATION_CONFIG_REPLY, ((e, result) => {
            if(result.error) {
                reject(result.error)
            }
            resolve(result);
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.LOAD_APPLICATION_CONFIG)
    })
}

export const loadCommonConfig = () => {
    return new Promise<CommonConfig>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.LOAD_HTML_CONFIG_REPLY, ((e, result) => {
            if(result.error) {
                reject(result.error)
            }
            resolve(result);
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.LOAD_HTML_CONFIG)
    })
}

export const loadAllConfig = () => {
    return new Promise<any>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.LOAD_ALL_CONFIG_REPLY, ((e, result) => {
            if(result.error) {
                reject(result.error)
            }
            resolve(result);
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.LOAD_ALL_CONFIG)
    })
}

export const loadPageConfig = async <T>(configPath : string) :Promise<T>=> {
    return await new Promise<T>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.READ_FILE_REPLY, ((e, result) => {
            if(result.error) {
                reject(result.error)
            }
            resolve(JSON.parse(new TextDecoder().decode(result)));
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.READ_FILE,{path : configPath})
    })
}

export const createNewPage = (param : HTMLView) => {
    return new Promise<void>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.CREATE_NEW_PAGE_REPLY, ((e, error) => {
            if(error) {
                reject(error)
            }
            resolve();
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.CREATE_NEW_PAGE, param)
    })

}

export const applyPreview = (param : HTMLPageParams) => {
    return new Promise<void>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.APPLY_PREVIEW_REPLY, ((e, error) => {
            if(error) {
                reject(error)
            }
            resolve();
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.APPLY_PREVIEW, param)
    })
}

export const writeFile = (param : WriteFileParam) => {
    return new Promise<void>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.WRITE_FILE_REPLY, ((event,error) => {
            if(error) {
                reject(error)
            }
            resolve();
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.WRITE_FILE, param)
    })
}

export const copyFile = (param : CopyFileParam) => {
    return new Promise<void>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.COPY_FILE_REPLY, ((event,error) => {
            if(error) {
                reject(error)
            }
            resolve();
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.COPY_FILE, param)
    })
}

export const readFile = (param : ReadFileParam) => {
    return new Promise<Buffer>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.READ_FILE_REPLY, ((event, result) => {
            if(result.error) {
                reject(result.error)
            }
            resolve(result);
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.READ_FILE, param)
    })
}

export const exportProject = (param : ExportProjectParam) => {
    return new Promise<void>((resolve, reject) => {
        window.ipcRenderer.once(IPC_RENDERER_EVENTS.EXPORT_PROJECT_REPLY, ((event,error) => {
            if(error) {
                reject(error)
            }
            resolve();
        }))
        window.ipcRenderer.send(IPC_RENDERER_EVENTS.EXPORT_PROJECT, param)
    })
}