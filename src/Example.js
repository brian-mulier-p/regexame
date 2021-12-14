import React from "react";
import "./Example.css"
import {VscError, VscPass} from "react-icons/all";

export default function Example(props) {
    return (
        <div>{props.regex === undefined
            ? ""
            : props.regex.test(props.children)
                ? <VscPass/>
                : <VscError/>}
            <span>{props.children}</span></div>
    );
}