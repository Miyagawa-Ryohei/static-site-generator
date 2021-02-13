import React, {ChangeEvent, useEffect, useState} from 'react';
import {BrowserWindow, remote} from "electron";
import {
    Button, CircularProgress, CssBaseline,
    Grid
} from "@material-ui/core";
import {Preview} from "../preview";
import * as api from "../../../usecase/common";
import {
    DocumentViewParam, HtmlDocumentView,
    HTMLPageParams,
    HTMLPageTypes,
    HtmlPanelView,
    PanelViewParam
} from "../../../../proceedures/model/htmlparams";
import {ApplicationSetting} from "../../../../proceedures/model/application-setting";
import SimpleMDE from 'react-simplemde-editor';
import marked from "marked";
import highlightjs from 'highlight.js';
import "easymde/dist/easymde.min.css";

marked.setOptions({
    highlight: function(code, lang) {
        return highlightjs.highlightAuto(code, [lang]).value;
    },               // シンタックスハイライトに使用する関数の設定
    pedantic: false, // trueの場合はmarkdown.plに準拠する gfmを使用する場合はfalseで大丈夫
    gfm: true,       // GitHub Flavored Markdownを使用
    breaks: true,    // falseにすると改行入力は末尾の半角スペース2つになる
    sanitize: true,  // trueにすると特殊文字をエスケープする
    silent: false    // trueにするとパースに失敗してもExceptionを投げなくなる
});

interface Seed {
    image: string,
    name: string,
    abstract: string
    detailHtml: string
}

interface Props {
    dir : string[]
}

// const win = BrowserWindow.getFocusedWindow();
export const DocumentView: React.FC<Props> = (props :Props) => {
    const [htmlConfig, setHTMLConfig] = useState<HTMLPageParams | undefined>(undefined);
    const [latestConfig, setHTMLLatestConfig] = useState<HTMLPageParams | undefined>(undefined);
    const [show, setShow] = useState<boolean>(false);
    const [applicationSetting, setApplicationSetting] = useState<ApplicationSetting>({
        dataDir: "",
        pathSep: "/"
    });
    const [preview, setPreview] = useState<number>(0);
    const [editFile, setEditFile] = useState<string>("");

    useEffect(() => {
        setEditFile(props.dir[props.dir.length - 1]);
    },[props.dir])

    useEffect(() => {
        const f = async () => {
            try {
                const applicationSetting = await api.loadConfig();
                const commonConfig = await api.loadCommonConfig();
                const pageConfig = await api.loadPageConfig<DocumentViewParam[]>([applicationSetting.dataDir, "data", "document_view.json"].join(applicationSetting.pathSep));
                const pages: HtmlDocumentView[] = pageConfig.map((c, i) => {
                    return {
                        type: HTMLPageTypes.DOCUMENT_VIEW,
                        param: c
                    }
                })

                setApplicationSetting(applicationSetting);
                setHTMLConfig({
                    common: commonConfig,
                    pages: pages
                })
                setHTMLLatestConfig({
                    common: commonConfig,
                    pages: pages
                })

            } catch (e) {
                console.log(e)
            }
        };
        f().catch(e => console.log(e));
        return () => {
            onSave()
            return;
        }
    }, []);

    useEffect(() => {
        if (!htmlConfig) return;
        const f = async () => {
            try {
                const newConfig = JSON.parse(JSON.stringify(htmlConfig)) as HTMLPageParams;
                await api.applyPreview(newConfig);

                setPreview(Date.now);
            } catch(e) {
                console.error(e)
            }
        }
        f().catch(e => console.log(e));

    }, [htmlConfig]);


    const getHTMLView = (): DocumentViewParam => {
        const newConfig = JSON.parse(JSON.stringify(htmlConfig)) as HTMLPageParams;
        const pages: HtmlDocumentView[] = newConfig.pages.map((v, i, obj): HtmlDocumentView => {
            return v as HtmlDocumentView;
        });
        const page_index = pages.findIndex((v, i, obj) => v.param.pageName === editFile);
        return pages[page_index].param
    }

    const onSave = async () => {
        await api.writeFile({
            path: [applicationSetting.dataDir, "data", "document_view.json"].join(applicationSetting.pathSep),
            data: JSON.stringify(htmlConfig?.pages.map(p => p.param), null, 2)
        })
        setHTMLLatestConfig(htmlConfig);
    }

    const setText = (text : string) => {
        const lines = text.split("\n");
        const newConfig = JSON.parse(JSON.stringify(htmlConfig)) as HTMLPageParams;
        const pages: HtmlDocumentView[] = newConfig.pages.map((v, i, obj): HtmlDocumentView => {
            return v as HtmlDocumentView;
        });
        const page_index = pages.findIndex((v, i, obj) => v.param.pageName === editFile);
        pages[page_index].param.textLines=lines;
        pages[page_index].param.htmlLines = marked(lines.join("\n")).split("\n")
        newConfig.pages = pages;
        setHTMLConfig(newConfig);
    }

    if (!htmlConfig) {
        return (<CircularProgress/>)
    }

    return (
        <>
            <Grid container>
                <Grid item lg={6} md={12}>
                    <div style={{margin: "20px"}}>
                        <Button disabled={JSON.stringify(htmlConfig) === JSON.stringify(latestConfig)}
                                onClick={() => onSave()} variant="outlined"
                                color="primary">
                            保存する
                        </Button>
                        <SimpleMDE value={getHTMLView().textLines.join("\n")} onChange={(e) => setText(e)}/>
                    </div>
                </Grid>
                <Grid item lg={6} md={12}>
                    <Preview url={`http://localhost:3000/${editFile}.html`} rendering={preview}/>
                </Grid>
            </Grid>
        </>
    );
};