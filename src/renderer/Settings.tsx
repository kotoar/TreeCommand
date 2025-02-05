import React, {useState} from "react";
import {CommandNode} from "./CommandNode";
import {Box, Button, Container, MenuItem, Select, Stack, TextField, Typography} from "@mui/material";
import {BackNode, ExpandNode, OpenAppNode} from "./CommandAction";
import LaunchIcon from '@mui/icons-material/Launch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import {ActionType} from "../main/Store";
import {CommandTree} from "./CommandTree";

export const Settings: React.FC = () => {
    const editing = new EditingNodes()
    const [tree, setTree] = React.useState<CommandTree>(CommandTree.tree());
    CommandTree.listener.add(() => {
        setTree(CommandTree.tree())
    })
    console.log("settings: ", tree)

    return <Stack direction='column'>
        <Typography>Settings</Typography>
        {
            tree.rootList.map(n =>
                <SettingItem node={n} indent={0} editing={editing} />)
        }
    </Stack>
}

function SettingItem(params: {
    node: CommandNode,
    indent: number,
    editing: EditingNodes
}) {
    const [expand, setExpand] = useState<boolean>(false);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [key, setKey] = useState<string>(params.node.key);
    const [description, setDescription] = useState<string>(params.node.description);
    const [selection, setSelection] = useState<ActionType>(params.node.type);
    const expandable = params.node instanceof ExpandNode;
    const [path, setPath] = useState<string>((params.node instanceof OpenAppNode) ? params.node.appPath : '');


    function SettingsPrefix(): JSX.Element {
        switch(params.node.type) {
            case "open":
                return <Stack direction='row'>
                    <LaunchIcon />
                    <Typography>OpenApp</Typography>
                </Stack>
            case "back":
                return <Stack direction='row'>
                    <ArrowBackIcon />
                    <Typography>Back</Typography>
                </Stack>
            case 'expand':
                return <Stack direction='row'>
                    {expand ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    <Typography>Expand</Typography>
                </Stack>
        }
    }

    function ActionDetails(): JSX.Element {
        switch (selection) {
            case 'open':
                return <Stack direction='row' alignItems='center'>
                    <Typography>Path: </Typography>
                    <TextField sx={{
                        fontSize: "14px",
                        height: "20px", // ✅ Force height
                        "& .MuiInputBase-root": {
                            height: "20px", // ✅ Input container height
                            padding: "0px", // ✅ Remove default padding
                        },
                        "& .MuiOutlinedInput-input": {
                            height: "20px", // ✅ Text height
                            padding: "0px 8px", // ✅ Adjust text padding
                            fontSize: "12px", // ✅ Adjust font size if needed
                            lineHeight: "normal",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                            height: "20px", // ✅ Ensure border matches height
                        },
                    }}
                               value={path}
                               onChange={(event) => setPath(event.target.value)}
                               fullWidth={true} />
                </Stack>
            default:
                return <></>
        }
    }

    function toggleExpand() {
        if(!expandable) return;
        setExpand(!expand);
    }

    function toggleEdit() {
        if(showDetails) {
            setShowDetails(false);
            params.editing.registeredListener = () => {}
        } else {
            setShowDetails(true)
            params.editing.registeredListener()
            params.editing.registeredListener = () => {
                setShowDetails(false)
            }
        }

    }

    function childViews(): JSX.Element[] {
        const node = params.node
        if(expandable && expand && node instanceof ExpandNode) {
            return node.children.map(
                n => <SettingItem node={n} indent={params.indent + 1} editing={params.editing} />
            )
        }
        return []
    }

    function updateNode() {
        switch(selection) {
            case 'open':
                params.node = new OpenAppNode(key, description, path)
                break;
            case 'back':
                params.node = new BackNode(key, path)
                break;
            case 'expand':
                params.node = new ExpandNode(key, path)
        }
        // PreferenceStore.preferences.update()
    }

    return <Stack direction='row' sx={{cursor: 'default'}}>
        <Box sx={{width: params.indent * 20}} />
        <Stack direction='column' flexGrow='1'>
            <Stack direction='column' border='1px solid black' borderRadius='3px'>
                <Stack direction='row' onClick={toggleExpand}>
                    <SettingsPrefix />
                    <Typography>{params.node.present()}</Typography>
                    <EditIcon style={{marginLeft: 'auto'}} onClick={() => toggleEdit()} />
                </Stack>
                {   !showDetails ? <></> :
                    <Stack direction='column' spacing='15px' padding='10px'>
                        <Stack direction='row' spacing='10px' alignItems='center'>
                            <Typography lineHeight='20px'>Key</Typography>
                            <Button variant='outlined'
                                    sx={{minHeight:'20x', height: '20px', lineHeight: 'normal', fontSize: '14px'}}>
                                {key}
                            </Button>
                            <Typography lineHeight='20px'>Description</Typography>
                            <TextField
                                sx={{
                                    fontSize: "14px",
                                    height: "20px", // ✅ Force height
                                    "& .MuiInputBase-root": {
                                        height: "20px", // ✅ Input container height
                                        padding: "0px", // ✅ Remove default padding
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        height: "20px", // ✅ Text height
                                        padding: "0px 8px", // ✅ Adjust text padding
                                        fontSize: "12px", // ✅ Adjust font size if needed
                                        lineHeight: "normal",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        height: "20px", // ✅ Ensure border matches height
                                    },
                                }}
                                value={description}
                                onChange={(event) => {setDescription(event.target.value)}} />
                        </Stack>
                        <Stack direction='row' spacing='10px'>
                            <Typography lineHeight='20px'>Action</Typography>
                            <Select value={selection}
                                    onChange={(event) => setSelection(event.target.value as ActionType)}
                                    variant='outlined'
                                    sx={{minHeight:'20x', height: '20px', lineHeight: 'normal', fontSize: '14px'}}>
                                <MenuItem value='expand'>Expand</MenuItem>
                                <MenuItem value='back'>Back</MenuItem>
                                <MenuItem value='open'>Open App</MenuItem>
                            </Select>
                        </Stack>
                        <ActionDetails />
                        <Stack direction='row' spacing='5px' marginX='auto'>
                            <Button variant='contained' onClick={
                                () => {
                                    toggleEdit()
                                    updateNode()
                                }
                            }>Apply</Button>
                            <Button variant='contained' onClick={() => toggleEdit()}>Cancel</Button>
                        </Stack>
                    </Stack>
                }
            </Stack>
            { childViews() }
        </Stack>
    </Stack>
}

class EditingNodes {
    registeredListener() {}
}