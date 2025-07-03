import React, {useEffect, useRef} from 'react';
import {mainViewModel, presentText} from "../viewmodel/mainViewModel";
import {useSnapshot} from "valtio/react";
import {CommandNode} from "../../shared/command-node";

const MainView: React.FC = () => {
    const viewModel = useSnapshot(mainViewModel);
    const ref = useRef<HTMLDivElement>(null);
    const padding = 15; // Padding for the main view

    useEffect(() => {
        if (ref.current) {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                const width = Math.max(rect.width + padding * 2, 400); // Ensure minimum width
                const height = rect.height + padding * 2; // Ensure minimum height
                window.electronAPI.resizeMainWindow(width, height);
                console.log("Main window resized to:", width, "x", height);
            }
        }
    }, [viewModel.items.length]);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                color: "white",
                padding: `${padding}px`,
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-start",
            }}
        >
            <div
                ref={ref}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "8px",
                    width: "fit-content",
                    height: "fit-content",
                    minWidth: 0,
                    minHeight: 0,
                }}
            >
                {viewModel.items.length > 0 ? (
                    viewModel.items.map(item => (
                        <div key={item.id} style={{ width: "100%" }}>
                            [{item.key}] {presentText(item)}
                        </div>
                    ))
                ) : (
                    <>
                        <div>Empty</div>
                        <div>[Ctrl + ,] Go to preferences to add commands</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MainView;
