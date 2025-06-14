import React from 'react';
import ReactDOM from 'react-dom/client';
import MainView from './view/MainView';
import { HashRouter, Route, Routes } from "react-router-dom";
import {PreferencesView} from "./view/Preferences";
import {keyEventsRegister} from "./model/keyEventsRegister";
import {Provider} from "../components/ui/provider";
import {commandTreeVM} from "./viewmodel/CommandTreeVM";

const rootElement = document.getElementById('root');

commandTreeVM.loadAll().then(() => {
    console.log("Command tree loaded successfully");
}).catch(error => {
    console.error("Failed to load command tree:", error);
});

if(rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <HashRouter>
            <Routes>
                <Route path="/" element={<Provider><MainView /></Provider>} />
                <Route path="/preferences" element={<Provider><PreferencesView /></Provider>} />
            </Routes>
        </HashRouter>,
    );
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.style.overflow = "hidden"; // ✅ Force no scroll
});

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

    commandTreeVM.items().filter((item) => event.key === item.key).forEach((item => {
        console.log("Item key pressed:", item.key, "Description:", item.description);
        switch (item.actionType) {
            case 'expand':
                commandTreeVM.selectedRootId = item.id; break;
            case 'back':
                commandTreeVM.selectedRootId = commandTreeVM.item(commandTreeVM.selectedRootId)?.parentId || "root"; break;
            case 'open':
                window.electronAPI.triggerAction('open', item.actionParameters); break;
            default:
                console.warn(`Unknown action type: ${item.actionType}`);
        }
    }));
});
