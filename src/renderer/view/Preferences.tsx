import React, {useState} from "react";
import {
  Text, VStack, HStack, Box, Button, Input, IconButton
} from "@chakra-ui/react";
import {useSnapshot} from "valtio/react";
import {CommandNodeVM, commandTreeVM} from "../viewmodel/CommandTreeVM";
import {ActionType, CommandNode} from "../../shared/command-node";
import {useColorModeValue} from "../../components/ui/color-mode";
import { MdArrowDropDown } from "react-icons/md";
import { MdArrowRight } from "react-icons/md";
import { MdAdd } from "react-icons/md";
import { MdEdit } from "react-icons/md";


export const PreferencesView: React.FC = () => {
    const viewModel = useSnapshot(commandTreeVM);
    const [tabIndex, setTabIndex] = useState(0);

    return (
      <Box w="100%" p={6} bg={useColorModeValue("gray.50", "gray.800")} minH="100vh">
        <HStack gap={4} mb={6}>
          <Button
            variant={tabIndex === 0 ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => setTabIndex(0)}
          >
            Commands
          </Button>
          <Button
            variant={tabIndex === 1 ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => setTabIndex(1)}
          >
            Quit
          </Button>
        </HStack>
        {tabIndex === 0 && (
          <Box maxW="900px">
            <TreeView nodes={viewModel.nodes} rootId={viewModel.selectedRootId} />
          </Box>
        )}
        {tabIndex === 1 && (
          <Text>Quit preferences content goes here.</Text>
        )}
      </Box>
    );
}

interface TreeViewProps {
    nodes: Map<string, CommandNode>;
    rootId: string;
}

const EditExpandableNode: React.FC<{ node ?: CommandNodeVM; parentId ?: string; onDismiss: () => void; }> = ({ node, parentId, onDismiss }) => {
  const [key, setKey] = useState(node?.key || "");
  const [description, setDescription] = useState(node?.description || "");

  const handleSave = async () => {
    if (!key.trim()) { return;}
    if (node) {
      // Update existing node
      await window.commandAPI.update({ ...node, key, description });
      commandTreeVM.loadAll().then(() => {});
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
      const id = await window.commandAPI.create(newNode, parentId);
      commandTreeVM.loadAll().then(() => {});
      onDismiss();
    }
  };

  return (
    <HStack mt={2} gap={2}>
      <Input
        size="sm"
        placeholder="Key"
        value={key}
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

const EditOpenNode: React.FC<{ node ?: CommandNodeVM; parentId ?: string; onDismiss: () => void; }> = ({ node, parentId, onDismiss }) => {
    const [key, setKey] = useState(node?.key || "");
    const [description, setDescription] = useState(node?.description || "");
    const [path, setPath] = useState(node?.actionParameters[0] || "");

    const handleSave = async () => {
    if (!key.trim()) { return;}
    if (node) {
      // Update existing node
      await window.commandAPI.update({
        ...node,
        key,
        description,
        actionParameters: [path]
      });
      commandTreeVM.loadAll().then(() => {});
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
      const id = await window.commandAPI.create(newNode, parentId);
      commandTreeVM.loadAll().then(() => {});
      onDismiss();
    }
  };

    return (
        <HStack mt={2} gap={2}>
            <Input
                size="sm"
                placeholder="Key"
                value={key}
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

const EditBackNode: React.FC<{ node ?: CommandNodeVM; parentId ?: string; onDismiss: () => void; }> = ({ node, parentId, onDismiss }) => {
    const [key, setKey] = useState(node?.key || "");
    const [description, setDescription] = useState(node?.description || "");

    const handleSave = async () => {
      if (!key.trim()) { return;}
      if (node) {
        // Update existing node
        await window.commandAPI.update({ ...node, key, description });
        commandTreeVM.loadAll().then(() => {});
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
          const id = await window.commandAPI.create(newNode, parentId);
          commandTreeVM.loadAll().then(() => {});
          onDismiss();
      }
    };

    return (
        <HStack mt={2} gap={2}>
            <Input
                size="sm"
                placeholder="Key"
                value={key}
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

const TreeNode: React.FC<{ node: CommandNodeVM }> = ({ node }) => {
  switch (node.actionType) {
    case 'expand':
      return <ExpandableTreeNode node={node} />;
    case 'open':
      return (
        <HStack>
          <Text fontWeight="medium">{node.key}</Text>
          <Text fontSize="sm" color="gray.500">{node.description}</Text>
        </HStack>
      );
    case 'back':
      return (
        <HStack>
          <Text fontWeight="medium">{node.key}</Text>
          <Text fontSize="sm" color="gray.500">{node.description}</Text>
        </HStack>
      );
    default:
      return <></>;
  }
}

const ExpandableTreeNode: React.FC<{ node: CommandNodeVM }> = ({ node }) => {
  const viewModel = useSnapshot(commandTreeVM);
  const expanded = viewModel.expanded.has(node.id);
  const [addFormSelection, setAddFormSelection] = useState<'create' | 'edit' | null>(null);
  const [addFormOpen, setAddFormOpen] = useState<ActionType | undefined>(undefined);

  const toggle = () => {
    if(commandTreeVM.expanded.has(node.id)) {
      commandTreeVM.expanded.delete(node.id);
    } else {
      commandTreeVM.expanded.add(node.id);
    }
    commandTreeVM.expanded = new Set(commandTreeVM.expanded);
  };

  function NodeSelectionView(): JSX.Element {
    return (
      <HStack mt={2} gap={2}>
        <Button size="sm" onClick={() => setAddFormOpen('expand')}>Expandable</Button>
        <Button size="sm" onClick={() => setAddFormOpen('open')}>Open</Button>
        <Button size="sm" onClick={() => setAddFormOpen('back')}>Back</Button>
      </HStack>
    );
  }

  function EditView(selection: 'create' | 'edit', type: ActionType): JSX.Element {
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
            return <EditExpandableNode node={node} parentId={undefined} onDismiss={onDismiss} />;
          case 'open':
            return <EditOpenNode node={node} parentId={undefined} onDismiss={onDismiss} />;
          case 'back':
            return <EditBackNode node={node} parentId={undefined} onDismiss={onDismiss} />;
        }
    }
  }

  return (
    <Box>
      <HStack py={2} px={4} gap={2} borderBottomWidth={expanded ? "1px" : "0"}>
        <IconButton aria-label={expanded ? "Collapse" : "Expand"} size="sm" variant="ghost"
          onClick={e => { e.stopPropagation(); toggle(); }}
        >
          {expanded ? <MdArrowDropDown /> : <MdArrowRight />}
        </IconButton>
        <Text fontWeight="bold">{node.key}</Text>
        <Text fontSize="sm" color="gray.500">{node.description}</Text>
        <IconButton aria-label="Add" size="sm" variant="ghost"
          onClick={e => { e.stopPropagation(); setAddFormSelection('create'); }}
        >
          <MdAdd />
        </IconButton>
        <IconButton aria-label="Edit" size="sm"
          onClick={e => { e.stopPropagation(); setAddFormSelection('edit'); setAddFormOpen('expand'); }}
        >
          <MdEdit />
        </IconButton>
      </HStack>
      <Box py={2} px={4}>
        {addFormSelection && <NodeSelectionView />}
        {addFormOpen && addFormSelection && EditView(addFormSelection, addFormOpen)}
        {expanded && (
          <VStack align="start" gap={1} w="100%">
            {node.children.length === 0 && (
              <Text fontSize="sm" color="gray.400" pl={2}>No children</Text>
            )}
            {
              node.children.map((childId) => {
                const child = viewModel.item(childId);
                return child ? (
                  <TreeNode key={child.id} node={child} />
                ) : null;
              }).filter(n => n !== null)
            }
          </VStack>
        )}
      </Box>
    </Box>
  );
};

const TreeView: React.FC<TreeViewProps> = ({ nodes, rootId }) => {
    const root = nodes.get(rootId);
    if (!root) return <Text color="red.500">Invalid root node</Text>;

    return <TreeNode node={root} />;
};