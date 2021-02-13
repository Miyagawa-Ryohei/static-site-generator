import React, {ChangeEvent, useEffect, useState} from 'react';
import {remote} from "electron";
import {
    Button,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    IconButton, MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Theme
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import * as api from "../../../usecase/common";
import {CommonConfig, getEmptyParam, HTMLPageTypes, HTMLView} from "../../../../proceedures/model/htmlparams";
import {ApplicationSetting} from "../../../../proceedures/model/application-setting";
import {ArrowDownward, ArrowUpward, Delete} from "@material-ui/icons";

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
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    }),
);

interface PageInfo {
    pageName : string,
    fileName : string
    type : HTMLPageTypes
}

export const CreateNewPage: React.FC = () => {

    const classes = useStyles();
    const [pageInfo, setPageInfo] = useState<PageInfo>({
        pageName : "",
        fileName : "",
        type : HTMLPageTypes.PANEL_VIEW
    })

    const handleTypeChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        pageInfo.type = e.target.value as HTMLPageTypes
        setPageInfo({...pageInfo})
    }
    const handlePageNameChange = (newOne : string) => {
        pageInfo.pageName = newOne
        setPageInfo({...pageInfo})
    }
    const handleFileNameChange = (newOne : string) => {
        pageInfo.fileName = newOne
        setPageInfo({...pageInfo})
    }
    const create = async () => {
        const newPageSetting : HTMLView = getEmptyParam(pageInfo.type, pageInfo.fileName)
        try {
            await api.createNewPage(newPageSetting);
            setPageInfo({
                pageName : "",
                fileName : "",
                type : HTMLPageTypes.PANEL_VIEW
            })
        } catch (e) {
            console.log(e)
        }

    }

    return (
        <>
            <FormControl required className={classes.formControl}>
                <h3>ページ名</h3>
                <TextField
                    onChange={(e) => handlePageNameChange(e.target.value)}
                    variant={"outlined"}
                    value={pageInfo.pageName}
                />
            </FormControl>
            <FormControl required className={classes.formControl}>
                <h3>ページタイプ</h3>
                <Select
                    labelId="demo-simple-select-required-label"
                    id="demo-simple-select-required"
                    value={pageInfo.type}
                    onChange={handleTypeChange}
                    className={classes.selectEmpty}
                >
                    {Object.entries(HTMLPageTypes).map((type,index) => (
                        <MenuItem key={index} value={type[1]}>{type[0]}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl required className={classes.formControl}>
                <h3>ファイル名</h3>
                <TextField
                    onChange={(e) => handleFileNameChange(e.target.value)}
                    variant={"outlined"}
                    value={pageInfo.fileName}
                />
            </FormControl>
            <Button onClick={() => create()} color="primary">
                作成する
            </Button>
        </>
    );
};

