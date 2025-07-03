import React, {useEffect, useState} from "react";
import {
	Text, VStack, HStack, Box, Button, Input, IconButton, Kbd, Show, For, Badge, Card
} from "@chakra-ui/react";
import {ActionType, CommandNode} from "../../shared/command-node";
import {MdArrowDropDown, MdBackspace, MdDelete, MdOpenWith} from "react-icons/md";
import { MdArrowRight } from "react-icons/md";
import { MdAdd } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import {presentText} from "../viewmodel/mainViewModel";

export const CommandTreeView: React.FC = () => {
	const [root, setRoot] = useState<CommandNode | undefined>(undefined);
	useEffect(() => {
		const fetchChildren = async () => {
			const children = await window.commandAPI.children('root');
			const rootNode: CommandNode = {
				id: 'root',
				key: '',
				description: 'Root Node',
				actionType: 'expand',
				actionParameters: [],
				children: children
			};
			setRoot(rootNode);
		};
		fetchChildren().then(r => {});
	}, []);
	return (
		root ? <TreeNode node={root} parentId={''} updateParent={() => {}} />
		: <Text>Loading...</Text>
	);
}

interface EditNodeParams {
	node?: CommandNode;
	parentId: string;
	updateParent?: () => void;
	onDismiss: () => void;
}

interface NodeParams {
	node: CommandNode;
	parentId: string;
	updateParent: () => void;
}

const EditExpandableNode: React.FC<EditNodeParams> = ({node, parentId, updateParent, onDismiss}) => {
	const [key, setKey] = useState(node?.key || "");
	const [description, setDescription] = useState(node?.description || "");

	const handleSave = async () => {
		if (!key.trim()) { return; }
		if (node) {
			// Update existing node
			window.commandAPI.update({ ...node, key, description }, parentId).then(() => {
				updateParent?.();
				onDismiss()
			});
		} else {
			// Create new node if node is undefined
			const newNode: Omit<CommandNode, 'id'> = {
				key,
				description,
				actionType: 'expand',
				actionParameters: [],
				children: []
			};
			window.commandAPI.create(newNode, parentId).then(() => {
				updateParent?.();
				onDismiss();
			});
		}
	};

	return (
		<VStack align='stretch'>
			<Text>Expand</Text>
			<HStack mt={2} gap={2}>
				<Input
					size="sm"
					placeholder="Key"
					value={key}
					maxLength={1}
					onChange={e => setKey(e.target.value)}
				/>
				<Input
					size="sm"
					placeholder="Description"
					value={description}
					onChange={e => setDescription(e.target.value)}
				/>
				<Box flexGrow={1}></Box>
				<Button size="sm" onClick={handleSave} disabled={!key.trim()}>
					Save
				</Button>
				<Button size="sm" onClick={onDismiss}>Cancel</Button>
			</HStack>
		</VStack>
	);
}

const EditOpenNode: React.FC<EditNodeParams> = ({ node, parentId, updateParent, onDismiss }) => {
	const [key, setKey] = useState(node?.key || "");
	const [description, setDescription] = useState(node?.description || "");
	const [path, setPath] = useState(node?.actionParameters[0] || "");

	const handleSave = async () => {
		if (!key.trim()) { return;}
		const adjustedPath = path.trim().replace(/^['"]|['"]$/g, '');
		if (node) {
			// Update existing node
			window.commandAPI.update({...node, key, description, actionParameters: [adjustedPath]}, parentId).then(() => {
				updateParent?.();
				onDismiss();
			});
		} else {
			// Create new node if node is undefined
			const newNode: Omit<CommandNode, 'id'> = {
				key,
				description,
				actionType: 'open',
				actionParameters: [adjustedPath],
				children: []
			};
			window.commandAPI.create(newNode, parentId).then(() => {
				updateParent?.();
				onDismiss();
			});
		}
	};

	return (
		<VStack align='stretch'>
			<Text>Open</Text>
			<HStack mt={2} gap={2}>
				<Input
					size="sm"
					placeholder="Key"
					value={key}
					maxLength={1}
					onChange={e => setKey(e.target.value)}
					width="15px"
				/>
				<Input
					size="sm"
					placeholder="Description"
					value={description}
					onChange={e => setDescription(e.target.value)}
				/>
				<Box flexGrow={1}></Box>
				<Button size="sm" colorScheme="blue" onClick={handleSave} disabled={!key.trim()}>
					Save
				</Button>
				<Button size="sm" onClick={onDismiss}>Cancel</Button>
			</HStack>
			<HStack mt={2} gap={2}>
				<Input
					size="sm"
					placeholder="Path"
					value={path}
					onChange={e => setPath(e.target.value)}
					width="200px"
				/>
			</HStack>
		</VStack>
	);
}

const EditBackNode: React.FC<EditNodeParams> = ({ node, parentId, updateParent, onDismiss }) => {
	const [key, setKey] = useState(node?.key || "");

	const handleSave = async () => {
		if (!key.trim()) { return;}
		if (node) {
			// Update existing node
			window.commandAPI.update({ ...node, key }, parentId).then(() => {
				updateParent?.();
				onDismiss();
			});
		} else {
			// Create new node if node is undefined
			const newNode: Omit<CommandNode, 'id'> = {
				key,
				description: '',
				actionType: 'back',
				actionParameters: [],
				children: []
			};
			window.commandAPI.create(newNode, parentId).then(() => {
				updateParent?.();
				onDismiss();
			});
		}
	};

	return (
		<VStack align='stretch'>
			<Text>Back</Text>
			<HStack mt={2} gap={2}>
				<Input
					size="sm"
					placeholder="Key"
					value={key}
					maxLength={1}
					onChange={e => setKey(e.target.value)}
					width="25px"
				/>
				<Box flexGrow={1}></Box>
				<Button size="sm" colorScheme="blue" onClick={handleSave} disabled={!key.trim()}>
					Save
				</Button>
				<Button size="sm" onClick={onDismiss}>Cancel</Button>
			</HStack>
		</VStack>
	);
}

const TreeNode: React.FC<NodeParams> = ({ node, parentId, updateParent }) => {
	const [expanded, setExpanded] = useState<boolean>(false);
	const [subNodes, setSubNodes] = useState<CommandNode[]>([]);
	const [addFormSelection, setAddFormSelection] = useState<'create' | 'edit' | null>(null);
	const [addFormOpen, setAddFormOpen] = useState<ActionType | undefined>(undefined);

	async function toggleExpand(override?: boolean): Promise<void> {
		if(override !== undefined) {
			if(override === expanded) { return;}
			setExpanded(override);
			if (override) {
				const nodes = await window.commandAPI.children(node.id);
				setSubNodes(nodes);
				console.log(`[expand node] Expanding node: ${node.id} with children:`, nodes);
			} else {
				setSubNodes([]);
				console.log(`[expand node] Collapsing node: ${node.id}`);
			}
			return;
		}
		if (!expanded) {
			const nodes = await window.commandAPI.children(node.id);
			setSubNodes(nodes);
			console.log(`[expand node] Collapsing node: ${node.id} with children:`, nodes);
		} else {
			setSubNodes([]);
			console.log(`[expand node] Expanding node: ${node.id}`);
		}
		setExpanded(!expanded);
	}

	const onUpdateSubNodes = () => {
		window.commandAPI.children(node.id).then((nodes) => setSubNodes(nodes))
	}

	function NodeSelectionView(): JSX.Element {
		function badgeVariant(type: ActionType): 'outline' | 'solid' {
			return (addFormOpen === type) ? 'solid' : 'outline';
		}
		return (
			<HStack mt={2} gap={2}>
				<Badge variant={badgeVariant('expand')} onClick={() => setAddFormOpen('expand')}>Expand</Badge>
				<Badge variant={badgeVariant('open')} onClick={() => setAddFormOpen('open')}>Open</Badge>
				<Badge variant={badgeVariant('back')} onClick={() => setAddFormOpen('back')}>Back</Badge>
			</HStack>
		)
	}

	function EditView(selection: 'create' | 'edit', type: ActionType) {
		const onDismiss = () => {
			setAddFormOpen(undefined);
			setAddFormSelection(null);
		}
		switch (selection) {
			case 'create':
				switch (type) {
					case 'expand':
						return <EditExpandableNode node={undefined} parentId={node.id} updateParent={onUpdateSubNodes} onDismiss={onDismiss} />;
					case 'open':
						return <EditOpenNode node={undefined} parentId={node.id} updateParent={onUpdateSubNodes} onDismiss={onDismiss} />;
					case 'back':
						return <EditBackNode node={undefined} parentId={node.id} updateParent={onUpdateSubNodes} onDismiss={onDismiss} />;
				}
			case 'edit':
				switch (type) {
					case 'expand':
						return <EditExpandableNode node={node} parentId={parentId} updateParent={updateParent} onDismiss={onDismiss} />;
					case 'open':
						return <EditOpenNode node={node} parentId={parentId} updateParent={updateParent} onDismiss={onDismiss} />;
					case 'back':
						return <EditBackNode node={node} parentId={parentId} updateParent={updateParent} onDismiss={onDismiss} />;
				}
		}
	}

	function LeadingIcon() {
		switch (node.actionType) {
			case 'expand':
				return (
					<IconButton size="sm" variant="ghost" onClick={e => {
						e.stopPropagation();
						toggleExpand().then(() => {});
					}}>
					{expanded ? <MdArrowDropDown /> : <MdArrowRight />}
					</IconButton>
				);
			case 'open':
				return (
					<IconButton size="sm" variant="plain">
						<MdOpenWith />
					</IconButton>
				);
			case 'back':
				return (
					<IconButton size="sm" variant="plain">
						<MdBackspace />
					</IconButton>
				)
			default:
				return null;
		}
	}

	return (
		<VStack w='100%' align='stretch'>
			<HStack gap={2} alignItems="center">
				<LeadingIcon />
				<Kbd>{node.key}</Kbd>
				<Text fontSize="sm">{presentText(node)}</Text>
				<Box flexGrow={1}></Box>
				<Show when={node.actionType === 'expand'}>
					<IconButton
						size="sm"
						variant="ghost"
						onClick={e => {
							e.stopPropagation();
							toggleExpand(true).then(() => {
								if (addFormSelection === 'create') {
									setAddFormSelection(null);
								} else {
									setAddFormSelection('create');
								}
							});
						}}
					>
						<MdAdd />
					</IconButton>
				</Show>
				<Show when={node.id !== 'root'}>
					<IconButton
						size="sm"
						variant="ghost"
						onClick={e => {
							e.stopPropagation();
							setAddFormSelection('edit');
							setAddFormOpen(node.actionType);
						}}
					>
						<MdEdit />
					</IconButton>
					<IconButton
						size="sm"
						variant="ghost"
						onClick={e => {
							e.stopPropagation();
							window.commandAPI.delete(node.id, parentId).then(() => {
								updateParent()
							});
						}}
					>
						<MdDelete />
					</IconButton>
				</Show>
			</HStack>
			<Show when={addFormSelection}>
				<Card.Root size="sm">
					<Card.Body>
						<Show when={addFormSelection === 'create'}>
							<NodeSelectionView />
						</Show>
						<Show when={addFormOpen}>
							{EditView(addFormSelection!, addFormOpen!)}
						</Show>
					</Card.Body>
				</Card.Root>
			</Show>
			<Show when={expanded}>
				<HStack>
					<Box w='15px' />
					<VStack align="stretch" w="100%">
						<For each={subNodes}>
							{(child: CommandNode) => (
								<TreeNode key={child.id} node={child} parentId={node.id} updateParent={onUpdateSubNodes} />
							)}
						</For>
					</VStack>
				</HStack>
			</Show>
		</VStack>
	)
}


