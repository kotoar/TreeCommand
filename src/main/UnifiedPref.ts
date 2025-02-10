export type FocusedWindow = "Main" | "Preferences";

export class UnifiedPref {
    static focusWindow: FocusedWindow | null = null;
}