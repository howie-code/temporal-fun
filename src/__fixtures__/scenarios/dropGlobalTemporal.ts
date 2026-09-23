// Bun has native Temporal; drop it so a scenario can simulate a non-native runtime.
delete (globalThis as { Temporal?: unknown }).Temporal;
