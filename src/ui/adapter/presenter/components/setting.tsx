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

export const Setting: React.FC = () => {

    return (
        <>
            {"各種設定"}
        </>
    );
};
