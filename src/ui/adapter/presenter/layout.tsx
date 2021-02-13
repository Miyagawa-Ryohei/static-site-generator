import React from "react";
import {ApplicationRoute} from "./routing";
import { BrowserRouter as Router} from 'react-router-dom';
import AppHeaderBar from "./header";
import {makeStyles} from "@material-ui/core/styles";
import {AppBar, createStyles, Theme} from "@material-ui/core";
import clsx from "clsx";
interface IProps {}

const drawerWidth = 240;


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            top: "10vh",
        },
        contentShift : {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            top: "10vh",
        }
    })
)



export const ApplicationLayout : React.FC<IProps> = (props : IProps) => {

    const [open, setOpen] = React.useState(false);
    const classes = useStyles();

    return (
        <Router>
            <AppHeaderBar open={open} setOpen={setOpen} />
            <div className={clsx(classes.root, {
                [classes.contentShift]: open,
            })}>
                <ApplicationRoute/>
            </div>
        </Router>
    );
}