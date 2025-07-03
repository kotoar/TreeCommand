import React from "react";
import {Text, VStack, HStack, Box, Button, Show, Switch, For, Kbd, Spacer} from "@chakra-ui/react";
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
      <HStack p={15} gap='25px' bg={bgColor} minW='100vw' minH='100vh' align="stretch">
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
          <Box flexGrow={1}></Box>
          <Button
            variant={"surface"}
            colorPalette="red"
            onClick={() => window.electronAPI.quitApp()}
          >
            Quit
          </Button>
        </VStack>
        <Box
          overflowY='auto'
          h='100vh'
          w='100%'
          alignSelf='stretch'
          paddingY='25px'
        >
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
    <VStack align="start" gap='15px'>
      <Text fontSize="xl" fontWeight="bold">Preferences</Text>
      <HStack gap={2} align='baseline'>
        <Text fontWeight='bold' fontSize='sm'>Launch</Text>
        <Spacer width='10px' />
        <Kbd>Ctrl</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>Space</Kbd>
      </HStack>
      <Switch.Root
        name="startup"
        checked={viewModel.startup}
        onCheckedChange={(e: {checked: boolean}) => {
          preferencesViewModel.startup = e.checked;
        }}
      >
        <Switch.HiddenInput />
        <Switch.Label>
          <Text fontWeight='bold' fontSize='sm'>Start when system starts</Text>
        </Switch.Label>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
      <HStack gap={2}>
        <Text fontWeight='bold' fontSize='sm'>Position</Text>
        <Spacer width='10px' />
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
