# ferris-clipboard

A lightweight clipboard manager for macOS, built with Tauri, SvelteKit, and Rust.

Press a global shortcut and a small, borderless clipboard history panel pops
up at your cursor — pick something you copied earlier, pin items you want to
keep around, and redact values you don't want showing up in plain text.

## Features

- **Clipboard history** — every copy is recorded locally in a SQLite database
  and searchable/fuzzy-filterable from the History tab.
- **Global toggle shortcut** — `Shift+Space` by default, rebindable from
  Settings, brings the window up wherever your cursor is.
- **Saved items** — pin clipboard entries you want to keep across restarts
  instead of letting them age out of history.
- **Overrides** — swap a sensitive value (an API key, a password) for a
  display alias, so what you pasted stays out of your visible history.
- **Keyboard-first navigation** — `Cmd/Ctrl+1..4` jumps between tabs; the
  whole panel is usable without touching the mouse.
- Dark, transparent, always-on-top window that stays out of the way until
  you need it.

## Install

### Homebrew (macOS)

```
brew tap bck01215/ferris-clipboard
brew install --cask ferris-clipboard
```

ferris-clipboard is ad-hoc signed rather than notarized. The cask strips the
quarantine attribute on install so Gatekeeper won't flag it as "damaged" —
see [bck01215/homebrew-ferris-clipboard](https://github.com/bck01215/homebrew-ferris-clipboard)
for details.

### Manual

Download a release `.dmg` from the
[Releases page](https://github.com/bck01215/ferris-clipboard/releases). Since
the app isn't notarized, macOS will refuse to open it normally on first
launch — right-click the app and choose **Open**, or clear the quarantine
flag yourself:

```
xattr -cr /Applications/ferris-clipboard.app
```

## Development

Requires [Bun](https://bun.sh) and the [Rust toolchain](https://rustup.rs).

```
bun install
bun run tauri dev
```

Build a release bundle with:

```
bun run tauri build
```

## Tech stack

SvelteKit + TypeScript on the frontend, Tauri (Rust) for the native shell,
Tailwind CSS + flowbite-svelte for UI, and `@tauri-apps/plugin-sql`
(SQLite) for clipboard history storage.
