import * as React from "react";
import * as Radium from "radium";
import {IsoCanvas} from "./IsoCanvas";

@Radium
export class PageComponent extends React.Component<any, IPageComponentState> {

    public render() {
        return (
            <div style={[style.pageStyle, style.content]}>
                <IsoCanvas/>
            </div>
        );
    }
}

const style = {
    pageStyle: {
    },
    content: {
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "row"
    },
};

export interface IPageComponentState {
}