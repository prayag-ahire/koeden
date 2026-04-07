import React from "react";

interface Props {
onClick:React.MouseEventHandler<HTMLButtonElement>;
children:React.ReactNode
}

const primaryButton = ({onClick,children}:Props)=>{
    return <button onClick={onClick}>{children}</button>
}

module.exports = {primaryButton};