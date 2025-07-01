import React from 'react';
import ReactDOM from 'react-dom/client';
import MainView from './view/MainView';
import { HashRouter, Route, Routes } from "react-router-dom";
import {PreferencesView} from "./view/PreferencesView";
import {keyEventsRegister} from "./model/keyEventsRegister";
import {Provider} from "../components/ui/provider";
import {mainViewModel} from "./viewmodel/mainViewModel";
import {addEventListeners} from "./model/event-listener";
import {snapshot} from "valtio/vanilla";

const rootElement = document.getElementById('root');

if(rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <HashRouter>
            <Routes>
                <Route path="/" element={<MainView />} />
                <Route path="/preferences" element={<Provider><PreferencesView /></Provider>} />
            </Routes>
        </HashRouter>,
    );
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.style.overflow = "hidden"; // ✅ Force no scroll
    document.body.style.background = "transparent"; // ✅ Ensure transparent body
});

addEventListeners();

document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.repeat) return;

    console.log(`Key pressed: ${event.key}, Ctrl: ${event.ctrlKey}`);
    console.log(`Focused window: ${window.electronAPI.getFocusWindow()}`);

    keyEventsRegister.forEach((keyEvent) => {
        if (
          keyEvent.key === event.key &&
          (!keyEvent.ctrlKey || (keyEvent.ctrlKey && event.ctrlKey)) &&
          keyEvent.enabled()
        ) {
            keyEvent.handlers();
        }
    });

    snapshot(mainViewModel).items.filter((item) => event.key === item.key).forEach((item => {
        console.log("Item key pressed:", item.key, "Description:", item.description, "type:", item.actionType);
        switch (item.actionType) {
            case 'expand':
                mainViewModel.stack.push(item.id);
                console.log('push successful, current stack:', mainViewModel.stack);
                window.commandAPI.select(item.id).then(() => {});
                console.log('[event handler] Expand action triggered for item:', item.id);
                break;
            case 'back':
                mainViewModel.stack.pop();
                window.commandAPI.select(mainViewModel.stack[mainViewModel.stack.length - 1]).then(() => {});
                console.log('[event handler] Back action triggered, current stack:', mainViewModel.stack);
                break;
            case 'open':
                window.electronAPI.triggerAction('open', item.actionParameters);
                console.log('[event handler] Open action triggered for item:', item.id, 'with parameters:', item.actionParameters);
                break;
            default:
                console.warn(`Unknown action type: ${item.actionType}`);
        }
    }));
});
