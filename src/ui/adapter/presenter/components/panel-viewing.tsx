import React, {ChangeEvent, useEffect, useState} from 'react';
import {remote} from "electron";
import {
    Button,
    CircularProgress,
    Container,
    Dialog,
    Divider,
    Grid,
    Input,
    Paper,
    Slide,
    TextField,
    Typography
} from "@material-ui/core";
import {TransitionProps} from "@material-ui/core/transitions";
import {Preview} from "../preview";
import {CopyFileParam} from "../../../../proceedures/model/ipcmodel";
import * as api from "../../../usecase/common";
import {copyFile} from "../../../usecase/common";
import {HTMLPageParams, HTMLPageTypes, HtmlPanelView, PanelViewParam} from "../../../../proceedures/model/htmlparams";
import {ApplicationSetting} from "../../../../proceedures/model/application-setting";

const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

interface Seed {
    image: string,
    name: string,
    tags: string[],
    abstract: string
    detailHtml?: string[]
}

const win = BrowserWindow.getFocusedWindow();

interface Props {
    dir : string[]
}
export const PanelView: React.FC<Props> = (props :Props) => {
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
        const f = async () => {
            setEditFile(props.dir[props.dir.length - 1]);
        }
        f();
    },[props.dir])

    useEffect(() => {
        const f = async () => {
            try {
                const applicationSetting = await api.loadConfig();
                setApplicationSetting(applicationSetting);
                const commonConfig = await api.loadCommonConfig();
                const pageConfig = await api.loadPageConfig<PanelViewParam[]>([applicationSetting.dataDir, "data", HTMLPageTypes.PANEL_VIEW+".json"].join(applicationSetting.pathSep));
                const pages: HtmlPanelView[] = pageConfig.map((c, ) => {
                    return {
                        type: HTMLPageTypes.PANEL_VIEW,
                        param: c
                    }
                })
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
            onSave().catch(e => console.log(e))
            return;
        }
    }, []);

    useEffect(() => {
        console.log("apply_preview")
        if (!htmlConfig) return;
        const f = async () => {
            try {
                await api.applyPreview(htmlConfig);
                setPreview(Date.now);
            } catch(e) {
                console.error(e)
            }
        }
        f().catch(e => console.log(e));
        return
    }, [htmlConfig]);

    const onSave = async () => {
        await api.writeFile({
            path: [applicationSetting.dataDir,"data", "panel_view.json"].join(applicationSetting.pathSep),
            data: JSON.stringify(htmlConfig?.pages.map(p => p.param), null, 2)
        })
        setHTMLLatestConfig(htmlConfig);
    }

    const getHTMLPanelView = (): HtmlPanelView => {
        console.log(htmlConfig)
        const newConfig = JSON.parse(JSON.stringify(htmlConfig)) as HTMLPageParams;
        const pages: HtmlPanelView[] = newConfig.pages.map((v): HtmlPanelView => {
            return v as HtmlPanelView;
        });
        const page_index = pages.findIndex((v) => v.param.pageName === editFile);
        return pages[page_index]
    }

    const onOpen = () => {
        setShow(true);
    }

    const onUp = (id: number) => {
        const newConfig = JSON.parse(JSON.stringify(htmlConfig)) as HTMLPageParams;
        const pages: HtmlPanelView[] = newConfig.pages.map((v): HtmlPanelView => {
            return v as HtmlPanelView;
        });
        const page_index = pages.findIndex((v) => v.param.pageName === editFile);
        const a = pages[page_index].param.panels[id - 1];
        pages[page_index].param.panels[id - 1] = pages[page_index].param.panels[id];
        pages[page_index].param.panels[id] = a
        newConfig.pages = pages;
        setHTMLConfig(newConfig);
    }

    const onDown = (id: number) => {
        const newConfig = JSON.parse(JSON.stringify(htmlConfig)) as HTMLPageParams;
        const pages: HtmlPanelView[] = newConfig.pages.map((v): HtmlPanelView => {
            return v as HtmlPanelView;
        });
        const page_index = pages.findIndex((v) => v.param.pageName === editFile);
        const a = pages[page_index].param.panels[id + 1];
        pages[page_index].param.panels[id + 1] = pages[page_index].param.panels[id];
        pages[page_index].param.panels[id] = a
        newConfig.pages = pages;
        setHTMLConfig(newConfig);
    }

    const onAdd = (s: Seed) => {
        const newConfig = JSON.parse(JSON.stringify(htmlConfig)) as HTMLPageParams;
        const pages: HtmlPanelView[] = newConfig.pages.map((v): HtmlPanelView => {
            return v as HtmlPanelView;
        });
        const page_index = pages.findIndex((v) => v.param.pageName === editFile);
        pages[page_index].param.panels.push(s)
        newConfig.pages = pages
        setHTMLConfig(newConfig);
    }

    const onDelete = (id: number) => {
        const newConfig = JSON.parse(JSON.stringify(htmlConfig)) as HTMLPageParams;
        const pages: HtmlPanelView[] = newConfig.pages.map((v): HtmlPanelView => {
            return v as HtmlPanelView;
        });
        const page_index = pages.findIndex((v) => v.param.pageName === editFile);
        const panels = pages[page_index].param.panels;
        pages[page_index].param.panels = panels.slice(0, id).concat(panels.slice(id + 1));
        newConfig.pages = pages
        setHTMLConfig(newConfig);
    }

    const onSelect = async (id: number) => {
        if (!win) return;
        const fileName = await dialog.showOpenDialog(
            win,
            {
                properties: ['openFile'],
                filters: [
                    {
                        name: "*",
                        extensions: ["png", "jpeg", "jpg"]
                    }
                ]
            },
        )
        const paths = fileName.filePaths[0].split(applicationSetting.pathSep)
        const param: CopyFileParam = {
            src: fileName.filePaths[0],
            dest: [applicationSetting.dataDir, "data", "public", "image", "products/", paths[paths.length - 1]].join(applicationSetting.pathSep)
        }
        await copyFile(param);

        await new Promise<void>(r => setTimeout(r, 3000));

        const newConfig = JSON.parse(JSON.stringify(htmlConfig)) as HTMLPageParams;
        const pages: HtmlPanelView[] = newConfig.pages.map((v): HtmlPanelView => {
            return v as HtmlPanelView;
        });
        const page_index = pages.findIndex((v) => v.param.pageName === editFile);
        pages[page_index].param.panels[id].image = paths[paths.length - 1];
        newConfig.pages = pages
        setHTMLConfig(newConfig);
    }


    const createList = () => {
        if (!htmlConfig) {
            return (<CircularProgress/>)
        }
        return getHTMLPanelView().param.panels.map((s, i) => {
            return (
                <Paper style={{padding: "5px"}}>
                    <Divider/>
                    <Button onClick={() => onUp(i)} disabled={i === 0}>↑</Button>
                    <Button onClick={() => onDown(i)}
                            disabled={i === getHTMLPanelView().param.panels.length - 1}>↓</Button>
                    <Divider/>
                    <Typography variant={"h6"}>{s.name}</Typography>
                    <Typography variant={"body1"}>{s.tags.join("  #")}</Typography>
                    <Divider/>
                    <Grid container>
                        <Grid item xs={4}>
                            <>
                                {s.image != "" ? (<img style={{width: "100%"}}
                                                       src={"file://" + applicationSetting.dataDir + "/data/public/image/products/" + s.image}/>) : (null)}
                                <Button onClick={() => onSelect(i)}>ファイルを選択</Button>
                            </>
                        </Grid>
                        <Grid item xs={4}>
                            {s.abstract}
                        </Grid>
                        <Grid item xs={4}>
                            {s.detailHtml}
                        </Grid>
                    </Grid>
                    <Button onClick={() => onDelete(i)}>行を削除</Button>
                </Paper>
            )
        })
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
                        <Button onClick={() => onOpen()} variant="outlined" color="primary">
                            追加する
                        </Button>
                        {createList()}
                    </div>
                    <RowAddDialog dataDir={applicationSetting.dataDir} onAdd={(e: Seed) => onAdd(e)}
                                  onHide={() => setShow(false)}
                                  open={show}/>
                </Grid>
                <Grid item lg={6} md={12}>
                    <Preview url={`http://localhost:3000/${editFile}.html`} rendering={preview}/>
                </Grid>
            </Grid>
        </>
    );
};

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


interface DialogProps {
    open: boolean;
    onAdd: (e: Seed) => void;
    onHide: () => void;
    dataDir: string
}

const RowAddDialog: React.FC<DialogProps> = (props: DialogProps) => {
    const [seed, setSeed] = useState<Seed & { preview?: string }>({
        image: "",
        name: "",
        tags: [],
        abstract: "",
        preview: "",
        detailHtml: []
    });

    const clear = () => {
        setSeed({
            image: "",
            name: "",
            tags: [],
            abstract: "",
            preview: "",
            detailHtml: []
        });
    }

    const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {

        setSeed({
            ...seed,
            name: e.target.value
        });
    }

    const onChangeDescribe = (e: ChangeEvent<HTMLInputElement>) => {
        setSeed({
            ...seed,
            abstract: e.target.value
        });
    }

    const onChangeDetail = (e: ChangeEvent<HTMLInputElement>) => {
        setSeed({
            ...seed,
            detailHtml: [e.target.value]
        });
    }

    const onChangeFileName = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            if (!e.target.files) return;
            if (ev.target?.result) {
                const dataurl = ev.target?.result as string
                const base64 = dataurl.split(";base64,")[1]
                const binstr = atob(base64)
                const uintArray = Uint8Array.from(binstr.split(""), e => e.charCodeAt(0))
                window.ipcRenderer.send("write-file", {
                    path: props.dataDir + "/data/public/image/products/" + e.target.files[0].name,
                    data: uintArray,
                    option: {encoding: "binary"}
                });
            }
            setSeed({
                ...seed,
                image: e.target.files[0].name,
                preview: ev.target?.result ? ev.target.result as string : ""
            });
        }
        reader.readAsDataURL(e.target.files[0]);
    }

    const validate = (): boolean => {
        return !(seed.name && seed.abstract)
    }

    const onChangeTag = (tags : string) => {
        setSeed({
            ...seed,
            tags: tags.split(",")
        });
    }

    const addAndClose = () => {
        const s = {...seed};
        delete s.preview;
        props.onAdd(s);
        clear();
        props.onHide()
    }
    const addAndContinue = () => {
        props.onAdd({
            image: seed.image,
            name: seed.name,
            tags : seed.tags,
            abstract: seed.abstract,
            detailHtml: seed.detailHtml
        });
        clear();
    }
    const onClose = () => {
        clear();
        props.onHide();
    }

    return (
        <Container>
            <Dialog fullScreen open={props.open} TransitionComponent={Transition}>
                <div style={{padding: "20px", paddingTop: "40px"}}>
                    <Typography variant={"h5"}>フルーツを追加する</Typography>
                    <div>
                        <Button disabled={validate()} onClick={() => addAndContinue()} variant="outlined"
                                color="primary">
                            追加して続ける
                        </Button>
                        <Button disabled={validate()} onClick={() => addAndClose()} variant="outlined"
                                color="secondary">
                            追加して閉じる
                        </Button>
                        <Button style={{float: "right"}} onClick={() => onClose()} variant="contained"
                                color="secondary">
                            閉じる
                        </Button>
                    </div>
                    <form noValidate autoComplete="off">
                        <Grid container>
                            <Grid item md={12} xl={6}>
                                <div style={{margin: "10px"}}>
                                    <TextField style={{width: "100%"}} id="standard-basic" label="名前"
                                               onChange={((event: ChangeEvent<HTMLInputElement>) => onChangeName(event))}/>
                                </div>
                                <div style={{margin: "10px"}}>
                                    <p>「,」で区切って複数指定</p>
                                    <TextField
                                        style={{width: "100%"}}
                                        id="outlined-basic"
                                        label="タグ"
                                        variant="outlined"
                                        onChange={((event: ChangeEvent<HTMLInputElement>) => onChangeTag(event.target.value))}
                                    />
                                </div>
                                <div style={{margin: "10px"}}>
                                    <TextField
                                        style={{width: "100%"}}
                                        id="outlined-basic"
                                        label="説明"
                                        variant="outlined"
                                        onChange={((event: ChangeEvent<HTMLInputElement>) => onChangeDescribe(event))}
                                        multiline
                                        rows={5}
                                    />
                                </div>
                                <div style={{margin: "10px"}}>
                                    <TextField
                                        style={{width: "100%"}}
                                        id="outlined-basic"
                                        label="詳細リンク先"
                                        variant="outlined"
                                        onChange={((event: ChangeEvent<HTMLInputElement>) => onChangeDetail(event))}
                                    />
                                </div>
                                <div style={{margin: "10px"}}>
                                    <Typography variant={"h6"}>画像を選択する</Typography>
                                    <Input type={"file"}
                                           onChange={((event: ChangeEvent<HTMLInputElement>) => onChangeFileName(event))}/>
                                </div>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <img src={seed.preview} width={"100%"}/>
                            </Grid>
                        </Grid>
                    </form>
                </div>
            </Dialog>
        </Container>
    );
};
