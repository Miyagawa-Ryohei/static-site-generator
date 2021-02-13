import {
    AppBar,
    createStyles, CssBaseline,
    Divider, Drawer, IconButton,
    List,
    ListItem,
    ListItemText,
    Theme, Toolbar, Typography, useTheme
} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import useReactRouter from "use-react-router"
import clsx from "clsx"
import {makeStyles} from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import {TreeItem, TreeView} from "@material-ui/lab";
import {
    AccessViewParam,
    CommonConfig, DocumentViewParam,
    HTMLPageParams,
    HTMLPageTypes,
    HtmlPanelView,
    PanelViewParam, ScheduleViewParam
} from "../../../proceedures/model/htmlparams";
import * as api from "../../usecase/common";
import {CalenderView} from "./components/calender-view";
import {BrowserWindow, dialog} from "electron";
import {IPC_RENDERER_EVENTS} from "../../../proceedures/model/events";
import {ApplicationSetting} from "../../../proceedures/model/application-setting";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        appBar: {
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            color: theme.palette.text.primary,
            position:"sticky",
            top:"0px",
            backgroundImage:"url(/header.jpg);",
            height: "10vh",
            justifyContent : "center"
        },
        appBarShift: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            color: theme.palette.text.primary,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            position:"sticky",
            top:"0px",
            height: "10vh",
            backgroundImage:"url(/header.jpg);",
            backgroundColor: "primary",
            justifyContent : "center"
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        hide: {
            display: 'none',
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
        },
        drawerHeader: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end',
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: -drawerWidth,
        },
        contentShift: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        },
        formControl: {
            margin: theme.spacing(1),
                minWidth: 120,
        },
        selectLeft: {
            marginLeft: "auto",
            color:"white"
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
        tree: {
            height: 240,
            flexGrow: 1,
            maxWidth: 400,
        }
    }),
);

export interface IProps {
    open : boolean
    setOpen : (open : boolean) => void;
}

interface Menu {
    common : CommonConfig,
    panelConfig : PanelViewParam[],
    documentConfig : DocumentViewParam[]
    calenderConfig : ScheduleViewParam[]
    accessConfig : AccessViewParam[]
}


// const win = BrowserWindow.getFocusedWindow();
// window.ipcRenderer.on('gen-introduce-reply', (_e, arg) => {
//     if (!win) return;
//     dialog.showOpenDialog(
//         win,
//         {
//             properties: ['openDirectory'],
//         },
//     ).then(fileName => {
//         window.ipcRenderer.send('write-file', {path: fileName.filePaths[0] + "/introduce.html", data: arg});
//     }).catch(e => {
//         console.log(e)
//     });
// });

const AppHeaderBar: React.FC<IProps> = (props : IProps) => {

    const {history} = useReactRouter();
    const classes = useStyles();
    const theme = useTheme();
    const [{common,panelConfig,documentConfig,calenderConfig,accessConfig}, setHtmlParams] = useState<Menu>({
        common : {
            pageTitle : "",
            menu: []
        },
        panelConfig : [],
        documentConfig : [],
        calenderConfig : [],
        accessConfig : []
    })

    useEffect(() => {
        const f = async () => {
            try {
                const applicationSetting = await api.loadConfig();
                window.ipcRenderer.on(IPC_RENDERER_EVENTS.LOAD_ALL_CONFIG_REPLY, (async (e, allConfig) => {
                    if(allConfig.error) {
                        console.log(allConfig.error)
                        return;
                    }
                    setHtmlParams({
                        common : allConfig.common,
                        documentConfig : allConfig.document,
                        panelConfig : allConfig.panel,
                        calenderConfig : allConfig.schedule,
                        accessConfig : allConfig.access,
                    })
                }))
                await reloadPageConfig()
            } catch (e) {
                console.log(e)
            }
        };
        f().catch(e => console.log(e));
        return () => {
            window.ipcRenderer.removeAllListeners(IPC_RENDERER_EVENTS.LOAD_HTML_CONFIG_REPLY)
        }
    }, []);

    const reloadPageConfig= async () => {
        const allConfig = await api.loadAllConfig();
        setHtmlParams({
            common : allConfig.common,
            documentConfig : allConfig.document,
            panelConfig : allConfig.panel,
            calenderConfig : allConfig.schedule,
            accessConfig : allConfig.access,
        })

    }

    const handleDrawerOpen = () => {
        props.setOpen(true);
    };

    const handleDrawerClose = () => {
        props.setOpen(false);
    };

    return (
        <>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: props.open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, props.open && classes.hide)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        { "ブラウザ URL : http://localhost:3000" }
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                className={classes.drawer}
                variant="persistent"
                anchor="left"
                open={props.open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerHeader}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </div>
                <Divider />
                <TreeView
                    className={classes.tree}
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                >
                    <TreeItem nodeId="new" label="新規ページ作成" onClick = {() => {
                        history.push("/new");
                        handleDrawerClose();
                    }} />
                    <TreeItem nodeId="home" label="ホーム" onClick = {() => {
                        history.push("/home");
                        handleDrawerClose();
                    }} />
                    {/*<TreeItem nodeId="menu" label="ページ一覧編集" onClick = {() => {*/}
                    {/*    history.push("/page-list");*/}
                    {/*    handleDrawerClose();*/}
                    {/*}} />*/}

                    <Divider/>

                    {/*<TreeItem nodeId="free_view" label="フリーページ編集">*/}
                    {/*    {documentConfig.map(dc => (*/}
                    {/*        <TreeItem*/}
                    {/*            key={`free_view/${dc.pageName}`}*/}
                    {/*            nodeId={`free_view/${dc.pageName}`}*/}
                    {/*            label={dc.pageName}*/}
                    {/*            onClick={()=>{*/}
                    {/*                history.push(`/free_view/${dc.pageName}`)*/}
                    {/*                handleDrawerClose();*/}
                    {/*            }}*/}
                    {/*        />*/}
                    {/*    ))}*/}
                    {/*</TreeItem>*/}
                    <TreeItem nodeId="document_view" label="ドキュメントページ編集">
                        {documentConfig.map(dc => (
                            <TreeItem
                                key={`document_view/${dc.pageName}`}
                                nodeId={`document_view/${dc.pageName}`}
                                label={dc.pageName}
                                onClick={()=>{
                                    history.push(`/document_view/${dc.pageName}`)
                                    handleDrawerClose();
                                }}
                            />
                        ))}
                    </TreeItem>
                    <TreeItem nodeId="panel_view" label="パネルビュー編集">
                        {panelConfig.map(pc => {
                            console.log(pc)
                            return (
                                <TreeItem
                                    key={`panel_view/${pc.pageName}`}
                                    nodeId={`panel_view/${pc.pageName}`}
                                    label={pc.pageName}
                                    onClick={()=>{
                                        history.push(`/panel_view/${pc.pageName}`)
                                        handleDrawerClose();
                                    }}
                                />
                            )}
                        )}
                    </TreeItem>
                    <TreeItem nodeId="calender_view" label="カレンダービュー編集">
                        {calenderConfig.map(cc => (
                            <TreeItem
                                key={`calender_view/${cc.pageName}`}
                                nodeId={`calender_view/${cc.pageName}`}
                                label={cc.pageName}
                                onClick={()=>{
                                    history.push(`/calender_view/${cc.pageName}`)
                                    handleDrawerClose();
                                }}
                            />
                        ))}
                    </TreeItem>
                    <TreeItem nodeId="access_view" label="アクセスビュー編集">
                        {accessConfig.map(ac => (
                            <TreeItem
                                key={`access_view/${ac.pageName}`}
                                nodeId={`access_view/${ac.pageName}`}
                                label={ac.pageName}
                                onClick={()=>{
                                    history.push(`/access_view/${ac.pageName}`)
                                    handleDrawerClose();
                                }}
                            />
                        ))}
                    </TreeItem>
                    <TreeItem nodeId="setting" label="アプリ設定" onClick = {() =>{
                        history.push("/setting");
                        handleDrawerClose();
                    }}>
                    </TreeItem>
                </TreeView>
            </Drawer>
        </>
    );
};


export default AppHeaderBar;
