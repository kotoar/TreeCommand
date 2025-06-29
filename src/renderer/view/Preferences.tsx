import React from "react";
import {Text, VStack, HStack, Box, Button, Show} from "@chakra-ui/react";
import {useSnapshot} from "valtio/react";
import {useColorModeValue} from "../../components/ui/color-mode";
import {PreferencesViewModel, preferencesViewModel} from "../viewmodel/preferencesViewModel";
import {CommandTreeView} from "./CommandTreeView";

export const PreferencesView: React.FC = () => {
    const viewModel: PreferencesViewModel = useSnapshot(preferencesViewModel);
    const bgColor = useColorModeValue("gray.50", "gray.800");

    return (
      <HStack p={6} bg={bgColor} minW='100vw' minH='100vh' align="start">
        <VStack gap={4} mb={6} align="stretch">
          <Button
            variant={viewModel.tab === 'preferences' ? "solid" : "outline"}
            onClick={() => preferencesViewModel.tab = 'preferences'}
          >
            Preferences
          </Button>
          <Button
            variant={viewModel.tab === 'commands' ? "solid" : "outline"}
            onClick={() => preferencesViewModel.tab = 'commands'}
          >
            Commands
          </Button>
        </VStack>
        <Box flexGrow={1} alignItems='flex-start'>
          <Show when={viewModel.tab === 'preferences'}>
            <PreferencesListView />
          </Show>
          <Show when={viewModel.tab === 'commands'}>
            <CommandTreeView />
          </Show>
        </Box>
      </HStack>
    );
}

const PreferencesListView: React.FC = () => {
  return (
    <VStack align="start" gap={4}>
      <Text fontSize="xl" fontWeight="bold">Preferences</Text>
      <HStack>
        <Text>Start with application</Text>
        <input
          type="checkbox"
          checked={preferencesViewModel.startup}
          onChange={(e) => preferencesViewModel.startup = e.target.checked}
        />
      </HStack>
    </VStack>
  );
}
