export type HtmlFileName = string
export type MarkDownText = string
export type HtmlText = string
export type RawText = string

export type AddPageParam = {
    pageName : string,
    pageType : HTMLPageTypes
}

export enum HTMLPageTypes {
    ACCESS_VIEW="access_view",
    PANEL_VIEW="panel_view",
    FREE_VIEW="free_view",
    SCHEDULE_VIEW="calender_view",
    DOCUMENT_VIEW="document_view"
}

export type HtmlViewBase = {
    type : HTMLPageTypes
}

export interface HtmlAccessView extends HtmlViewBase {
    type : HTMLPageTypes.ACCESS_VIEW
    param : AccessViewParam
}

export interface HtmlPanelView extends HtmlViewBase {
    type : HTMLPageTypes.PANEL_VIEW
    param : PanelViewParam
}

// export interface HtmlDetailView extends HtmlViewBase {
//     type : HTMLPageTypes.DETAIL_VIEW
//     param : DetailViewParam
// }

export interface HtmlDocumentView extends HtmlViewBase {
    type : HTMLPageTypes.DOCUMENT_VIEW
    param : DocumentViewParam
}

export interface HtmlScheduleView extends HtmlViewBase {
    type : HTMLPageTypes.SCHEDULE_VIEW
    param : ScheduleViewParam
}

export type HTMLView = HtmlAccessView | HtmlPanelView | HtmlScheduleView | HtmlDocumentView

export interface HTMLPageParams {
    common : CommonConfig
    pages : HTMLView[]
}

export interface CommonConfig {
    pageTitle : string;
    menu : {
        active : boolean
        href : string
        name : string
    }[]
    background? : {
        color?: string;
        image?: {
            name: string;
            repeat?: boolean;
        }
    }
}

type ViewParam = {
    pageName : string
}

export interface AccessViewParam extends ViewParam {
    name : string
    address : string
    tel : string
    map? : string
}

export const getEmptyParam = <T extends ViewParam>(type : HTMLPageTypes, name? : string) : HTMLView => {
    switch(type) {
        case HTMLPageTypes.ACCESS_VIEW:
            return {
                type : HTMLPageTypes.ACCESS_VIEW,
                param : getAccessViewEmptyParam(name)
            };
        case HTMLPageTypes.DOCUMENT_VIEW:
            return {
                type : HTMLPageTypes.DOCUMENT_VIEW,
                param : getDocumentViewEmptyParam(name)
            };
        case HTMLPageTypes.PANEL_VIEW:
            return {
                type : HTMLPageTypes.PANEL_VIEW,
                param : getPanelViewEmptyParam(name)
            };
        case HTMLPageTypes.SCHEDULE_VIEW:
            return {
                type : HTMLPageTypes.SCHEDULE_VIEW,
                param : getScheduleViewEmptyParam(name)
            };
        default:
            throw new Error("unknown html type is received");
    }
}



export const getAccessViewEmptyParam = (name? : string) : AccessViewParam => ({
    pageName : name? name : "",
    name : "",
    address : "",
    tel : "",
    map : ""
})

export interface PanelViewParam extends ViewParam {
    panels : {
        image : string
        name : string
        tags : string[]
        abstract : string
        detailHtml? : (HtmlFileName | DocumentViewParam)[]
    }[]
}
export const getPanelViewEmptyParam = (name? : string) : PanelViewParam => ({
    pageName : name? name : "",
    panels : []
})

export interface DocumentViewParam extends ViewParam {
    image? : string
    textLines : string[]
    htmlLines : string[]
    type : string
}

export const getDocumentViewEmptyParam = (name? : string) : DocumentViewParam => ({
    pageName : name? name : "",
    image : "",
    textLines : [],
    htmlLines : [],
    type : ""
})

// export interface DetailViewParam extends ViewParam {
//     name : string
//     image : string
//     describe : MarkDownText | HtmlText | RawText
//     map? : string
// }

export interface ScheduleViewParam extends ViewParam {
    schedules : {
        comment : string
        rest : boolean
        date : Date
    }[]
}

export const getScheduleViewEmptyParam = (name? : string) : ScheduleViewParam => ({
    pageName : name? name : "",
    schedules : []
})
