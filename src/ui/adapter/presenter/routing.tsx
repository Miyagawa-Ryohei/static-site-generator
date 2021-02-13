import {Route, Switch} from "react-router";
import React from "react";
import useReactRouter from "use-react-router"
import {PanelView} from "./components/panel-viewing";
import {Home} from "./components/home";
import {CalenderView} from "./components/calender-view";
import {Access} from "./components/access-view";
import {Setting} from "./components/setting";
import {DocumentView} from "./components/document-view";
import {makeStyles} from "@material-ui/core/styles";
import {createStyles, Theme} from "@material-ui/core";
import {CreateNewPage} from "./components/create-new-page";
interface IProps {}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding : '3rem',
        },
    }),
);

export const ApplicationRoute : React.FC<IProps> = (props : IProps) => {

    const { location , history } = useReactRouter()
    const classes = useStyles()
    const switchModule = () => {
        const dir = location.pathname.split("/")
        try {
            switch(dir[1]) {
                case "new":
                    return (<CreateNewPage />)
                case "document_view":
                    return (<DocumentView dir={dir}/>)
                case "panel_view":
                    return (<PanelView dir={dir}/>)
                case "calender_view":
                    return (<CalenderView dir={dir}/>)
                case "access_view":
                    return (<Access dir={dir}/>)
                case "setting":
                    return (<Setting />)
                default:
                    return (<Home />)
            }
        } catch (e){
            console.log(e)
        }
    }

    return (

        <div className={classes.root}>
            {switchModule()}
        </div>
    );
}