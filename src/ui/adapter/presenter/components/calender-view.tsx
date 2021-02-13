import React, {useState, useEffect,  ChangeEvent} from 'react';
import {remote} from "electron";
import {
    Button,
    Container,
    Dialog, Divider,
    Grid,
    Input,
    Paper,
    Slide,
    Table,
    TableBody,
    TableCell, TableHead,
    TableRow, TextField, Typography
} from "@material-ui/core";
import {TransitionProps} from "@material-ui/core/transitions";
import {Preview} from "../preview";

const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

interface Seed {
    image: string,
    name: string,
    describe: string
}

const win = BrowserWindow.getFocusedWindow();

interface Props {
    dir : string[]
}

export const CalenderView: React.FC<Props> = (props :Props) => {
    const [editFile, setEditFile] = useState<string>("");
    useEffect(() => {
        const f = async () => {
            setEditFile(props.dir[props.dir.length - 1]);
        }
        f();
    },[props.dir])

    return (
        <>
            {"休業日登録ページ"}
        </>
    );
};
