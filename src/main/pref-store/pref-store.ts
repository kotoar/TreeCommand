import {app} from "electron";
import path from "path";
import fs from "fs";
import {PreferencesList} from "../model";

export class PrefStore {
	static instance: PrefStore = new PrefStore();
	private readonly userDataPath;
	private readonly path;
	private defaultPreferences: PreferencesList = {
		startup: false,
		startPosition: 'bottom',
	}
	private constructor() {
		this.userDataPath = app.getPath('userData');
		this.path = path.join(this.userDataPath, 'pref.json');
		// Create file with default preferences if not exist
		if (!fs.existsSync(this.path)) {
			fs.writeFileSync(this.path, JSON.stringify(this.defaultPreferences, null, 2), 'utf-8');
		}
	}

	load(): PreferencesList {
		try {
			const data = fs.readFileSync(this.path, 'utf-8');
			const parsed = JSON.parse(data);
			const merged = { ...this.defaultPreferences, ...parsed } as PreferencesList;
			if (Object.keys(merged).length !== Object.keys(this.defaultPreferences).length) {
				this.save(merged);
			}
			return merged;
		} catch (e) {
			console.error('[PrefStore] Failed to load preferences:', e);
			return this.defaultPreferences;
		}
	}

	save(pref: PreferencesList)  {
		try {
			fs.writeFileSync(this.path, JSON.stringify(pref, null, 2), 'utf-8');
		} catch (e) {
			console.error('[PrefStore] Failed to save preferences:', e);
		}
	}
}