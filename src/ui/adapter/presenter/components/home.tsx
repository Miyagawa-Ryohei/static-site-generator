import React, {useState, useEffect,  ChangeEvent} from 'react';
import {remote} from "electron";
import {
    Button,
    createStyles,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider,
    Grid, IconButton,
    Input, List, ListItem, ListItemText,
    Table,
    TableBody,
    TableCell, TableHead,
    TableRow, TextField, Theme, Typography
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {
    CommonConfig,
} from "../../../../proceedures/model/htmlparams";
import * as api from "../../../usecase/common";
import {ApplicationSetting} from "../../../../proceedures/model/application-setting";
import {ArrowDownward, ArrowUpward, Delete} from "@material-ui/icons";
import {copyFile, exportProject, readFile, writeFile} from "../../../usecase/common";
import {CopyFileParam, ExportProjectParam} from "../../../../proceedures/model/ipcmodel";

const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

interface Seed {
    image: string,
    name: string,
    describe: string
}

const win = BrowserWindow.getFocusedWindow();

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.default,
        },
        dialogRoot: {
            margin : '5rem',
            backgroundColor: theme.palette.background.default,
        }
    }),
);

export const Home: React.FC = () => {

    const [item, setItem] = useState<{ index : number, name : string }>({index : 0, name : "project_setting"})
    const classes = useStyles();

    const renderContents = () => {
        switch(item.name) {
            case "project_setting":{
                return (<ProjectSetting />)
            }
            case "site_setting":{
                return (<SiteSetting />)
            }
        }
    }

    const handleListItemClick = (index:number, name : string) => {
        setItem({index,name})
    }

    return (
        <>
            <Grid container={true}>
                <Grid item={true} md={3}>
                    <div className={classes.root}>
                        <List component="nav" aria-label="main mailbox folders">
                            <ListItem
                                button
                                selected={item.index === 0}
                                onClick={(event) => handleListItemClick( 0,"project_setting")}
                            >
                                <ListItemText primary="プロジェクト設定" />
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                selected={item.index === 1}
                                onClick={(event) => handleListItemClick(1,"site_setting")}
                            >
                                <ListItemText primary="サイト設定" />
                            </ListItem>
                        </List>
                    </div>
                </Grid>
                <Grid item={true} md={9}>
                    <>
                    {renderContents()}
                    </>
                </Grid>
            </Grid>
        </>
    );
};

const SiteSetting: React.FC = () => {

    const [siteSetting, setSiteSetting] = useState<CommonConfig>({
        pageTitle : "",
        menu : [],
    })
    const [open, setOpen] = useState<boolean>(false)
    const [addingPageTitle, setAddingPageTitle] = useState<string>("")
    const [addingFName, setAddingFName] = useState<string>("")
    const [logo, setLogo] = useState<string>("")
    const [applicationSetting, setApplicationSetting] = useState<ApplicationSetting>({
        dataDir : "",
        pathSep : "/"
    })
    useEffect(() => {
        const f = async () => {
            try {
                const applicationSetting = await api.loadConfig();
                const commonConfig = await api.loadCommonConfig();
                setApplicationSetting(applicationSetting);
                setSiteSetting(commonConfig);
                const logoBin = await readFile({
                    path: [applicationSetting.dataDir,"data","public","image","logo.png"].join(applicationSetting.pathSep),
                });
                const bStr = Array.from(logoBin, e => String.fromCharCode(e)).join("");
                const dUrl = "data:application/octet-stream;base64," + btoa(bStr);
                setLogo(dUrl);
            } catch (e) {
                console.log(e)
            }
        };
        f();
    }, []);

    const changePageTitle = (newTitle : string) => {
        setSiteSetting({
            ...siteSetting,
            pageTitle : newTitle
        })
    }

    const loadLogo = (e : ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        var reader = new FileReader();
        reader.onload = async function (ev) {
            if (!e.target.files) return;
            if (ev.target?.result) {
                const dataurl = ev.target?.result as string
                const base64 = dataurl.split(";base64,")[1]
                const binstr = atob(base64)
                const uintArray = Uint8Array.from(binstr.split(""), e => e.charCodeAt(0))
                await writeFile({
                    path: [applicationSetting.dataDir,"data","public","image","logo.png"].join(applicationSetting.pathSep),
                    data: uintArray,
                    option: {encoding: "binary"}
                });
                setLogo(ev.target.result as string);
            }
        }
        reader.readAsDataURL(e.target.files[0]);
    }

    const moveListItem = (itemIndex:number, moveTo:number) => {
        const newSetting = {...siteSetting};
        const newMenu = newSetting.menu;
        const buf = newMenu[itemIndex + moveTo];
        newMenu[itemIndex + moveTo] = newMenu[itemIndex];
        newMenu[itemIndex] = buf;
        newSetting.menu = newMenu;
        setSiteSetting(newSetting);
    }

    const deleteListItem = (itemIndex:number) => {
        const newSetting = {...siteSetting};
        newSetting.menu.splice(itemIndex,1);
        setSiteSetting(newSetting);
    }

    const add = () => {
        const newSetting = {...siteSetting};
        newSetting.menu.push({
            active : false,
            href : addingFName,
            name : addingPageTitle
        });
        setSiteSetting(newSetting);
        setAddingPageTitle("")
        setAddingFName("")
    }

    const onSave = () => {
        api.writeFile({
            path: [applicationSetting.dataDir,"data","project.json"].join(applicationSetting.pathSep),
            data: JSON.stringify(siteSetting, null, 2)
        })
    }

    const closeAddMenuDialog = () => {
        setOpen(false)
    }


    const renderMenuList= () => {
        return siteSetting.menu.map((m,i) => (
            <TableRow key={i}>
                <TableCell>
                    <IconButton disabled={(i - 1 < 0)} onClick={() => moveListItem(i,-1)}>
                        <ArrowUpward />
                    </IconButton>
                    <IconButton disabled={(i + 1 >= siteSetting.menu.length)} onClick={() => moveListItem(i,1)}>
                        <ArrowDownward />
                    </IconButton>
                </TableCell>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.href}</TableCell>
                <TableCell>
                    <IconButton onClick={() => deleteListItem(i)}>
                        <Delete />
                    </IconButton>
                </TableCell>
            </TableRow>
        ))
    }


    return (
        <>
            <h3>ページタイトル</h3>
            <TextField variant={"outlined"}
                       label={"ページタイトル"}
                       onChange={(e ) => {
                           changePageTitle(e.target.value)
                       }}
                       value={siteSetting.pageTitle}
            />
            <h3>メニュー一覧
                <Button variant={"outlined"} onClick={()=>setOpen(true)}>追加する</Button>
                <Button variant={"outlined"} onClick={()=>onSave()}>保存</Button>
            </h3>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{""}</TableCell>
                        <TableCell>ページタイトル</TableCell>
                        <TableCell>HTMLファイル名</TableCell>
                        <TableCell>{""}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {renderMenuList()}
                </TableBody>
            </Table>
            <h3>サイトロゴ</h3>
            <Input type={"file"} onChange={(e : ChangeEvent<HTMLInputElement>) => loadLogo(e)} />
            {logo.length > 0 ? (<img src={logo} alt={"サイトロゴ画像"} />):(null)}
            <h3>背景設定</h3>

            <div>
                <Dialog open={open} onClose={closeAddMenuDialog} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                    <DialogContent>
                        <TextField
                            onChange={(e) => setAddingPageTitle(e.target.value)}
                            variant={"outlined"}
                            label={"ページタイトル"}
                        />
                        <br />
                        <br />
                        <TextField
                            onChange={(e) => setAddingFName(e.target.value)}
                            variant={"outlined"}
                            label={"HTMLファイル名"}
                        />
                        <br />
                        <br />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => add()} color="primary">
                            追加
                        </Button>
                        <Button onClick={closeAddMenuDialog} color="primary">
                            閉じる
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};

const ProjectSetting: React.FC = () => {

    const [projectRoot, setProjectRoot] = useState<string>("")
    const [projectName, setProjectName] = useState<string>("")
    const [open, setOpen] = useState<boolean>(false)
    const [applicationSetting, setApplicationSetting] = useState<ApplicationSetting>({
        dataDir : "",
        pathSep : "/"
    })

    const classes = useStyles();
    useEffect(() => {
        const f = async () => {
            try {
                const applicationSetting = await api.loadConfig();
                setApplicationSetting(applicationSetting);
            } catch (e) {
                console.log(e)
            }
        };
        f();
    }, []);

    const openCreateProjectDialog = () => {
        setOpen(true)
    }

    const closeCreateProjectDialog = () => {
        setOpen(false)
    }

    const onSave = () => {
        const siteSetting : CommonConfig= {
            pageTitle : "",
            menu : []
        }
        api.writeFile({
            path: [projectRoot, projectName, "project.json"].join(applicationSetting.pathSep),
            data: JSON.stringify(siteSetting, null, 2)
        })
    }

    const exportProjectFiles = async () => {
        if (!win) return;
        const fileName = await dialog.showSaveDialog(
            win,
            {
                properties: ['showOverwriteConfirmation'],
                filters: [
                    {
                        name: "*",
                        extensions: ["zip"]
                    }
                ]
            },
        )
        if(!fileName || !fileName.filePath) return;
        console.log(fileName)
        const param: ExportProjectParam = {
            src: [applicationSetting.dataDir, "data", "public"].join(applicationSetting.pathSep),
            dest: fileName.filePath
        }
        try {
            await exportProject(param);
        } catch(e){
            console.log(e)
        }
    }

    const createProject = () => {

    }

    const openProject = async () => {
        if (!win) return;
        const folderName = await dialog.showOpenDialog(
            win,
            {
                properties: ['openDirectory'],
            },
        )
        if(folderName.filePaths[0]) {
            setProjectRoot(folderName.filePaths[0])
        }
    }

    const referenceFolder = async () => {
        if (!win) return;
        const folderName = await dialog.showOpenDialog(
            win,
            {
                properties: ['openDirectory'],
            },
        )
        if(folderName.filePaths[0]) {
            setProjectRoot(folderName.filePaths[0])
        }
    }

    const changeProject = (pathString : string) => {
        const paths = projectRoot.split(applicationSetting.pathSep)
        setProjectRoot(paths.slice(0,paths.length-1).join(applicationSetting.pathSep))
        setProjectName(paths[paths.length-1])
    }

    const paths = projectRoot.split(applicationSetting.pathSep)
    return (
        <>
            <Button variant={"outlined"} onClick={()=>exportProjectFiles()}>現在のプロジェクトを書き出す</Button>
            <br />
            <Button variant={"outlined"} onClick={()=>openCreateProjectDialog()}>新規プロジェクト</Button>
            <br />
            <Button variant={"outlined"} onClick={()=>openProject()}>プロジェクトを開く</Button>
            <div>
                <Dialog open={open} onClose={closeCreateProjectDialog} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                    <DialogContent>
                        <TextField
                            variant={"outlined"}
                            label={"プロジェクト名"}
                            value={
                                paths.length > 0 ? paths[paths.length-1] : ""
                            }
                        />
                        <br />
                        <br />
                        <TextField
                            variant={"outlined"}
                            label={"プロジェクトフォルダ"}
                            onChange={(e) => {
                                changeProject(e.target.value)
                            }}
                            value={
                                paths.length > 0 ? paths.slice(0,paths.length-1).join(applicationSetting.pathSep) : ""
                            }
                        />
                        <Button variant={"contained"} size="large" onClick={() => referenceFolder()}>参照</Button>
                        <br />
                        <Button variant={"outlined"} size="large" onClick={() => createProject()}>作成</Button>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeCreateProjectDialog} color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};