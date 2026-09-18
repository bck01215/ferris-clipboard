<script lang="ts">
  /**
   * Click to record a shortcut: the next key combo pressed (at least one
   * non-modifier key, optionally with modifiers) is captured and emitted as a
   * Tauri accelerator string via the `change` event. Escape cancels; Backspace
   * or Delete with no other key clears.
   */
  import { Button } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";

  export let value: string | null = null;
  export let placeholder = "Click to set shortcut";

  const dispatch = createEventDispatcher<{ change: string | null }>();
  let recording = false;

  const MOD_KEYS = new Set([
    "Control",
    "Shift",
    "Alt",
    "Meta",
    "AltGraph",
    "OS",
  ]);

  /**
   * Translate a physical `KeyboardEvent.code` into a Tauri accelerator key.
   * We deliberately avoid `e.key` because modifiers (notably Option/Alt on
   * macOS) rewrite it into a composed character — `Option+V` reports `e.key`
   * as "√", which is not a valid accelerator. `e.code` is layout-independent.
   * Returns null for keys that can't stand alone in an accelerator.
   */
  function keyFromCode(code: string): string | null {
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit\d$/.test(code)) return code.slice(5);
    if (/^Numpad\d$/.test(code)) return code.slice(6);
    if (/^F\d{1,2}$/.test(code)) return code;
    if (/^Arrow(Up|Down|Left|Right)$/.test(code)) return code.replace("Arrow", "");

    const map: Record<string, string> = {
      Space: "Space",
      Enter: "Enter",
      Tab: "Tab",
      Backquote: "`",
      Minus: "-",
      Equal: "=",
      BracketLeft: "[",
      BracketRight: "]",
      Backslash: "\\",
      Semicolon: ";",
      Quote: "'",
      Comma: ",",
      Period: ".",
      Slash: "/",
      Home: "Home",
      End: "End",
      PageUp: "PageUp",
      PageDown: "PageDown",
      Insert: "Insert",
      NumpadAdd: "NumpadAdd",
      NumpadSubtract: "NumpadSubtract",
      NumpadMultiply: "NumpadMultiply",
      NumpadDivide: "NumpadDivide",
      NumpadDecimal: "NumpadDecimal",
    };
    return map[code] ?? null;
  }

  function accelFromEvent(e: KeyboardEvent): string | null {
    if (MOD_KEYS.has(e.key)) return null;

    const key = keyFromCode(e.code);
    if (!key) return null;

    const mods: string[] = [];
    if (e.ctrlKey) mods.push("Control");
    if (e.shiftKey) mods.push("Shift");
    if (e.altKey) mods.push("Alt");
    if (e.metaKey) mods.push("Super");

    return [...mods, key].join("+");
  }

  function onKeydown(e: KeyboardEvent) {
    if (!recording) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.key === "Escape") {
      recording = false;
      return;
    }
    if ((e.key === "Backspace" || e.key === "Delete") && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      value = null;
      recording = false;
      dispatch("change", null);
      return;
    }

    const accel = accelFromEvent(e);
    if (!accel) return; // modifier only, keep waiting
    value = accel;
    recording = false;
    dispatch("change", accel);
  }

  function start() {
    recording = true;
  }
</script>

<svelte:window on:keydown|capture={onKeydown} />

<Button
  size="xs"
  color={recording ? "yellow" : value ? "blue" : "alternative"}
  onclick={start}
  onblur={() => (recording = false)}
>
  {#if recording}
    Press keys… (Esc to cancel)
  {:else if value}
    {value}
  {:else}
    {placeholder}
  {/if}
</Button>
