import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter, Route, Routes } from "react-router-dom";
import {Settings} from "./Settings";
import {CommandTree} from "./CommandTree";
import {Preferences} from "./Preferences";

const rootElement = document.getElementById('root');
if(rootElement) {
    CommandTree.loadFromStore()
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <HashRouter>
            <Routes>
                <Route path="/" element={<App />} />
                {/*<Route path="/settings" element={<Settings />} />*/}
                <Route path="/preferences" element={<Preferences />} />
            </Routes>
        </HashRouter>,
    );
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.style.overflow = "hidden"; // ✅ Force no scroll
});

document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Skip handling keys inside input elements
    }
    if(window.electronAPI.getFocusWindow() !== "Main") {
        return;
    }
    if(event.key === 'Escape') {
        window.electronAPI.hideWindow();
    }
    if(event.ctrlKey && event.key === ",") {
        window.electronAPI.openPreferences();
    }

    const tree = CommandTree.tree()
    if(tree.detectKeyList().has(event.key)) {
        tree.detectKeyList().get(event.key)?.perform()
    }
})
