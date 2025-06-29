import React, {useEffect, useState} from "react";
import {
	Text, VStack, HStack, Box, Button, Input, IconButton, Kbd, Show, For
} from "@chakra-ui/react";
import {ActionType, CommandNode} from "../../shared/command-node";
import { MdArrowDropDown, MdDelete, MdKeyboardBackspace, MdOpenWith} from "react-icons/md";
import { MdArrowRight } from "react-icons/md";
import { MdAdd } from "react-icons/md";
import { MdEdit } from "react-icons/md";

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
		root ? <TreeNode node={root} parentId={''} />
		: <Text>Loading...</Text>
	);
}

interface NodeParams {
	node?: CommandNode;
	parentId: string;
	onDismiss: () => void;
}

const EditExpandableNode: React.FC<NodeParams> = ({node, parentId, onDismiss}) => {
	const [key, setKey] = useState(node?.key || "");
	const [description, setDescription] = useState(node?.description || "");

	const handleSave = async () => {
		if (!key.trim()) { return; }
		if (node) {
			// Update existing node
			window.commandAPI.update({ ...node, key, description }, parentId).then(() => {});
			onDismiss();
		} else {
			// Create new node if node is undefined
			const newNode: Omit<CommandNode, 'id'> = {
				key,
				description,
				actionType: 'expand',
				actionParameters: [],
				children: []
			};
			window.commandAPI.create(newNode, parentId).then(() => {});
			onDismiss();
		}
	};

	return (
		<HStack mt={2} gap={2}>
			<Input
				size="sm"
				placeholder="Key"
				value={key}
				maxLength={1}
				onChange={e => setKey(e.target.value)}
				width="120px"
			/>
			<Input
				size="sm"
				placeholder="Description"
				value={description}
				onChange={e => setDescription(e.target.value)}
				width="180px"
			/>
			<Button size="sm" colorScheme="blue" onClick={handleSave} disabled={!key.trim()}>
				Save
			</Button>
			<Button size="sm" onClick={onDismiss}>Cancel</Button>
		</HStack>
	);
}

const EditOpenNode: React.FC<NodeParams> = ({ node, parentId, onDismiss }) => {
	const [key, setKey] = useState(node?.key || "");
	const [description, setDescription] = useState(node?.description || "");
	const [path, setPath] = useState(node?.actionParameters[0] || "");

	const handleSave = async () => {
		if (!key.trim()) { return;}
		if (node) {
			// Update existing node
			window.commandAPI.update({...node, key, description, actionParameters: [path]}, parentId).then(() => {});
			onDismiss();
		} else {
			// Create new node if node is undefined
			const newNode: Omit<CommandNode, 'id'> = {
				key,
				description,
				actionType: 'open',
				actionParameters: [path],
				children: []
			};
			window.commandAPI.create(newNode, parentId).then(() => {});
			onDismiss();
		}
	};

	return (
		<HStack mt={2} gap={2}>
			<Input
				size="sm"
				placeholder="Key"
				value={key}
				maxLength={1}
				onChange={e => setKey(e.target.value)}
				width="120px"
			/>
			<Input
				size="sm"
				placeholder="Description"
				value={description}
				onChange={e => setDescription(e.target.value)}
				width="180px"
			/>
			<Input
				size="sm"
				placeholder="Path"
				value={path}
				onChange={e => setPath(e.target.value)}
				width="200px"
			/>
			<Button size="sm" colorScheme="blue" onClick={handleSave} disabled={!key.trim()}>
				Save
			</Button>
			<Button size="sm" onClick={onDismiss}>Cancel</Button>
		</HStack>
	);
}

const EditBackNode: React.FC<NodeParams> = ({ node, parentId, onDismiss }) => {
	const [key, setKey] = useState(node?.key || "");
	const [description, setDescription] = useState(node?.description || "");

	const handleSave = async () => {
		if (!key.trim()) { return;}
		if (node) {
			// Update existing node
			window.commandAPI.update({ ...node, key, description }, parentId).then(() => {});
			onDismiss();
		} else {
			// Create new node if node is undefined
			const newNode: Omit<CommandNode, 'id'> = {
				key,
				description,
				actionType: 'back',
				actionParameters: [],
				children: []
			};
			window.commandAPI.create(newNode, parentId).then(() => {});
			onDismiss();
		}
	};

	return (
		<HStack mt={2} gap={2}>
			<Input
				size="sm"
				placeholder="Key"
				value={key}
				maxLength={1}
				onChange={e => setKey(e.target.value)}
				width="120px"
			/>
			<Input
				size="sm"
				placeholder="Description"
				value={description}
				onChange={e => setDescription(e.target.value)}
				width="180px"
			/>
			<Button size="sm" colorScheme="blue" onClick={handleSave} disabled={!key.trim()}>
				Save
			</Button>
			<Button size="sm" onClick={onDismiss}>Cancel</Button>
		</HStack>
	);
}

const TreeNode: React.FC<{ node: CommandNode, parentId: string }> = ({ node, parentId }) => {
	switch (node.actionType) {
		case 'expand':
			return <ExpandableTreeNode node={node} parentId={parentId} />;
		case 'open':
			return (
				<HStack>
					<MdOpenWith />
					<Kbd>{node.key}</Kbd>
					<Text fontSize="sm">{node.description}</Text>
					<Box flexGrow={1}></Box>
					<IconButton
						variant="ghost"
						onClick={() => window.electronAPI.triggerAction('open', node.actionParameters)}
					>
						<MdDelete />
					</IconButton>
				</HStack>
			);
		case 'back':
			return (
				<HStack>
					<MdKeyboardBackspace />
					<Kbd>{node.key}</Kbd>
					<Text fontSize="sm">Back</Text>
					<Box flexGrow={1}></Box>
					<IconButton>
						<MdDelete />
					</IconButton>
				</HStack>
			);
		default:
			return <></>;
	}
}

const ExpandableTreeNode: React.FC<{ node: CommandNode, parentId: string }> = ({ node, parentId }) => {
	const [expanded, setExpanded] = useState<boolean>(false);
	const [subNodes, setSubNodes] = useState<CommandNode[]>([]);
	const [addFormSelection, setAddFormSelection] = useState<'create' | 'edit' | null>(null);
	const [addFormOpen, setAddFormOpen] = useState<ActionType | undefined>(undefined);

	async function toggleExpand() {
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

	function NodeSelectionView(): JSX.Element {
		return (
			<HStack mt={2} gap={2}>
				<Button size="sm" onClick={() => setAddFormOpen('expand')}>Expandable</Button>
				<Button size="sm" onClick={() => setAddFormOpen('open')}>Open</Button>
				<Button size="sm" onClick={() => setAddFormOpen('back')}>Back</Button>
			</HStack>
		);
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
						return <EditExpandableNode node={undefined} parentId={node.id} onDismiss={onDismiss} />;
					case 'open':
						return <EditOpenNode node={undefined} parentId={node.id} onDismiss={onDismiss} />;
					case 'back':
						return <EditBackNode node={undefined} parentId={node.id} onDismiss={onDismiss} />;
				}
			case 'edit':
				switch (type) {
					case 'expand':
						return <EditExpandableNode node={node} parentId={parentId} onDismiss={onDismiss} />;
					case 'open':
						return <EditOpenNode node={node} parentId={parentId} onDismiss={onDismiss} />;
					case 'back':
						return <EditBackNode node={node} parentId={parentId} onDismiss={onDismiss} />;
				}
		}
	}

	return (
		<VStack>
			<HStack py={2} px={4} gap={2}>
				<IconButton size="sm" variant="ghost" onClick={e => {
					e.stopPropagation();
					toggleExpand().then(() => {});
				}}>
					{expanded ? <MdArrowDropDown /> : <MdArrowRight />}
				</IconButton>
				<Kbd>{node.key}</Kbd>
				<Text fontSize="sm">{node.description}</Text>
				<Box flexGrow={1}></Box>
				<IconButton
					size="sm"
					variant="ghost"
					onClick={e => {
						e.stopPropagation();
						setAddFormSelection('create');
					}}
				>
					<MdAdd />
				</IconButton>
				<IconButton
					size="sm"
					variant="ghost"
					onClick={e => {
						e.stopPropagation();
						setAddFormSelection('edit');
						setAddFormOpen('expand');
					}}
				>
					<MdEdit />
				</IconButton>
			</HStack>
			<Show when={addFormSelection}>
				<NodeSelectionView />
			</Show>
			<Show when={addFormOpen && addFormSelection}>
				{EditView(addFormSelection!, addFormOpen!)}
			</Show>
			<Show when={expanded}>
				<HStack>
					<Box w='15px' />
					<VStack align="start" gap={1} w="100%">
						<For each={subNodes}>
							{(child: CommandNode) => (
								<TreeNode key={child.id} node={child} parentId={node.id} />
							)}
						</For>
					</VStack>
				</HStack>
			</Show>
		</VStack>
	);
};
