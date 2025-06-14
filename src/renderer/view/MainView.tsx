import React, {useEffect, useRef} from 'react';
import {Box, Text, VStack} from "@chakra-ui/react";
import {commandTreeVM} from "../viewmodel/CommandTreeVM";
import {useSnapshot} from "valtio/react";

const MainView: React.FC = () => {
    const viewModel = useSnapshot(commandTreeVM);
    const items = viewModel.items();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            window.electronAPI.resizeMainWindow(rect.width, rect.height);
        }
    }, [items.length]);

    return <Box ref={ref}>
        <VStack align="start" p={4} backgroundColor="blackAlpha.500" opacity={0.5}>
            {items.map(item => (
              <Text key={item.id}>[{item.key}] {item.description}</Text>
            ))}
            {
                items.length === 0 && <Text key="empty">[Ctrl + ,] Go to preferences to add commands</Text>
            }
        </VStack>
    </Box>
};

export default MainView;
