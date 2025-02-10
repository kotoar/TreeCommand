import {useEffect, useRef, useState} from 'react';
import {Box, Stack, Typography} from "@mui/material";
import React from 'react';
import {CommandTree} from "./CommandTree";

const App: React.FC = () => {
    const [list, setList] = useState<string[]>(CommandTree.tree().presentList());
    const channel = new BroadcastChannel('list-sync');

    useEffect(() => {
        channel.onmessage = (event) => {
            setList(event.data)
        }
    }, []);

    return <Box>
        <Stack direction="column" spacing='5px' padding='5px' style={{backgroundColor: `rgba(0, 0, 0, .8)`}}>
            <Typography key='xtitle' color='primary'>Command Tree</Typography>
            {
                list.map((node) =>
                    <Typography key={node} color='primary' style={{color: 'green'}}>{node}</Typography>
                )
            }
        </Stack>
    </Box>
};

export default App;
