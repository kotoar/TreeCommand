import { Tray, Menu, app } from 'electron';
import * as path from 'path';
import { __distname } from './main';
import {openPreferenceWindow} from "./events-handlers";

let tray: Tray | null = null;

export function traySetup() {
	tray = new Tray(path.join(__distname, 'static/icon-win.ico'));
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Open',
			click: () => {
				openPreferenceWindow()
			}
		},
		{
			label: 'Quit',
			click: () => {
				app.quit();
			}
		}
	]);
	tray.setToolTip('Command Tree');
	tray.setContextMenu(contextMenu);

	tray.on('click', () => {
		openPreferenceWindow();
	});
}