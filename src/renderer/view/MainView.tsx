import React, {useEffect, useRef} from 'react';
import {Box, For, Show, Text, VStack} from "@chakra-ui/react";
import {mainViewModel} from "../viewmodel/mainViewModel";
import {useSnapshot} from "valtio/react";

const MainView: React.FC = () => {
    const viewModel = useSnapshot(mainViewModel);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            window.electronAPI.resizeMainWindow(rect.width, rect.height);
        }
    }, [viewModel.items.length]);

    return (
        <Box
            ref={ref}
            backgroundColor="rgba(0,0,0,0.5)" // Half-transparent black
            position="fixed"
            inset={0}
        >
            <VStack align="start" p={4}>
                <For each={viewModel.items}>
                    { (item) => (
                      <Text key={item.id}>[{item.key}] {item.description}</Text>
                    )}
                </For>
                <Show when={viewModel.items.length === 0}>
                    <Text>Empty</Text>
                    <Text key="empty">[Ctrl + ,] Go to preferences to add commands</Text>
                </Show>
            </VStack>
        </Box>
    );
};

export default MainView;
