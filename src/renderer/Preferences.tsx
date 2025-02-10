import React, {useCallback, useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    TextField,
} from "@mui/material";
import {CommandTree} from "./CommandTree";

type PreferencesAlert = "updated" | "error" | null
type TabSelection = "exit" | "config"

export const Preferences: React.FC = () => {
    const [config, setConfig] = useState<string>("")
    useEffect(() => {
        setConfig(CommandTree.tree().rawValue);
    }, []);
    const handleChangeConfig = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(event.target.value);
    }, []);
    const [alert, setAlert] = useState<PreferencesAlert>(null)
    const [selection, setSelection] = useState<TabSelection>("config")

    const channel = new BroadcastChannel('list-sync');

    function updateTree() {
        if(window.electronAPI.updateEncodedTree(config)) {
            CommandTree.loadFromStore();
            channel.postMessage(CommandTree.tree().presentList());
            triggerAlert('updated')
        } else {
            triggerAlert('error')
        }
    }

    function triggerAlert(alert: PreferencesAlert) {
        switch (alert) {
            case "updated":
                setAlert('updated')
                setTimeout(() => {
                    setAlert(null)
                }, 3000)
                break
            case "error":
                setAlert('error')
                setTimeout(() => {
                    setAlert(null)
                }, 3000)
                break
            default: break
        }
    }

    return <Stack direction="row" spacing="2px" justifyContent='stretch'>
        <List component="nav">
            <ListItemButton>
                <ListItemText primary='Config' onClick={() => setSelection("config")} />
            </ListItemButton>
            <ListItemButton>
                <ListItemText primary='Exit App' onClick={() => {
                    setSelection('exit')
                    window.electronAPI.quitApp()
                }} />
            </ListItemButton>
        </List>
        <Box margin='10px' flexGrow={1}>
            {selection == 'config' ? <Stack direction="column" spacing='5px' >
                    <Box>
                        <TextField
                            value={config}
                            onChange={handleChangeConfig}
                            fullWidth={true}
                            multiline={true}
                            sx={{
                                '& .MuiInputBase-input': {
                                    overflowY: 'auto !important',  // Force on input element
                                    maxHeight: '300px'
                                }}}/>
                    </Box>
                    <Stack direction='row' spacing='10px'>
                        <Button variant='outlined' onClick={() => updateTree()}>Apply</Button>
                        {/*<Typography variant='body2' color='textSecondary'>instructions</Typography>*/}
                        { alert == "updated" ? <Alert severity='success'>Success</Alert> : null }
                        { alert == "error" ? <Alert severity='error'>Error</Alert> : null }
                    </Stack>
                </Stack> : null}
        </Box>
    </Stack>
}