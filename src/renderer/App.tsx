import {useEffect, useState} from 'react';
import {Stack, Typography} from "@mui/material";
import {CommandNode} from "./CommandNode";
import React from 'react';
import {CommandTree} from "./CommandTree";

const App: React.FC = () => {
    const [list, setList] = useState<CommandNode[]>(CommandTree.tree().presentList());

    CommandTree.listener.add(() => {
        setList(CommandTree.tree().presentList())
    })

    return <Stack direction="column" spacing='5px' padding='5px' style={{backgroundColor: `rgba(0, 0, 0, .8)`}}>
        <Typography key='xtitle' color='primary'>Command Tree</Typography>
        {
            list.map((node: CommandNode) =>
                <Typography key={node.present()} color='primary' style={{color: 'green'}}>{node.present()}</Typography>
            )
        }
    </Stack>
};

export default App;
