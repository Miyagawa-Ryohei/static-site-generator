
export interface WriteFileParam {
    path : string,
    data : string | Buffer | Uint8Array,
    option? : any
}

export type WriteFileResponse = string

export interface CopyFileParam {
    src : string,
    dest : string,
}

export interface CopyFileResponse {
    src : string,
    dest : string,
}

export interface ReadFileParam {
    path : string,
    option? : any
}

export type ReadFileResponse = Buffer | {
    error? : any
}

export type ExportProjectParam = {
    src : string,
    dest : string
}
