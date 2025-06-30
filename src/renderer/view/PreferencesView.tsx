import React from "react";
import {Text, VStack, HStack, Box, Button, Show, Switch, For} from "@chakra-ui/react";
import {useSnapshot} from "valtio/react";
import {useColorModeValue} from "../../components/ui/color-mode";
import {
  PreferencesViewModel,
  preferencesViewModel,
  StartPositionOption,
  startPositionOptions
} from "../viewmodel/preferencesViewModel";
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
        <Box overflow='auto' minH='100vh' w='100%' alignSelf='stretch'>
          <VStack flexGrow={1} alignItems='flex-start'>
            <Show when={viewModel.tab === 'preferences'}>
              <PreferencesListView />
            </Show>
            <Show when={viewModel.tab === 'commands'}>
              <CommandTreeView />
            </Show>
          </VStack>
        </Box>
      </HStack>
    );
}

const PreferencesListView: React.FC = () => {
  const viewModel = useSnapshot(preferencesViewModel);
  return (
    <VStack align="start" gap={4}>
      <Text fontSize="xl" fontWeight="bold">Preferences</Text>
      <Switch.Root
        name="startup"
        checked={viewModel.startup}
        onCheckedChange={(e: {checked: boolean}) => {
          preferencesViewModel.startup = e.checked;
        }}
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>
          Start when system starts
        </Switch.Label>
      </Switch.Root>
      <HStack gap={2}>
        <For each={startPositionOptions}>
          { (option: StartPositionOption) => (
            <Button
              key={option.value}
              variant={viewModel.position === option.value ? "solid" : "outline"}
              onClick={() => preferencesViewModel.position = option.value}
            >
              {option.description}
            </Button>
          )}
        </For>
      </HStack>
    </VStack>
  );
}
