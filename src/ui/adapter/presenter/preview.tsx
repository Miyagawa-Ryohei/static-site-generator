import React from "react";

interface Props {
    url : string;
    rendering : number;
}

export const Preview: React.FC<Props> = (prop) => {
    return (
        <iframe style={{width:"100%",height:"100%"}} src={prop.url+"?cache="+prop.rendering} />
    )
}
