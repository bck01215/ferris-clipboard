import { writable } from "svelte/store";

/**
 * Bumped whenever the window regains focus so History's search input can
 * (re)focus itself without +layout.svelte reaching into a sibling component.
 */
export const searchFocusRequest = writable(0);
