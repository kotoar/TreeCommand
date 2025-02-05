import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter, Route, Routes } from "react-router-dom";
import {Settings} from "./Settings";
import {CommandTree} from "./CommandTree";

const rootElement = document.getElementById('root');
if(rootElement) {

    CommandTree.tree(
        CommandTree.initializeFromPreference(window.electronAPI.loadEncodedTree())
    )
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <HashRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </HashRouter>,
    );
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.style.overflow = "hidden"; // ✅ Force no scroll
});

document.addEventListener('keydown',  (event: KeyboardEvent) => {
    console.log(event.key);

    if(event.key === 'Escape') {
        window.electronAPI.hideWindow();
    }
    if(event.ctrlKey && event.key === ",") {
        window.electronAPI.openSettings();
    }

    const tree = CommandTree.tree()
    if(tree.detectKeyList().has(event.key)) {
        tree.detectKeyList().get(event.key)?.perform()
    }
})

