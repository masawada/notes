# notes.masawada.me

A repository for publishing an Obsidian vault via GitHub Pages. Built with [Quartz v5](https://quartz.jzhao.xyz/) and served at https://notes.masawada.me.

## Structure

```
pages/     Markdown files (flat layout, TITLE.md)
images/    Image files (flat layout, unique names)
```

## How it works

- Edit `pages/` and `images/` in Obsidian
- The custom `sync-notes` plugin detects saves and automatically commits & pushes via git
- GitHub Actions builds with Quartz v5 and deploys to GitHub Pages

### sync-notes plugin

Located at `.obsidian/plugins/sync-notes/`. Features:

- **Auto sync**: Detects changes in `pages/` and `images/` → 30-second debounce → commit → push
- **Image rename**: Renames pasted/dropped images to unique names and saves them to `images/`

To rebuild after modifying the plugin source:

```
cd .obsidian/plugins/sync-notes
npm install
npm run build
```

## Setup

1. In the GitHub repository Settings → Pages → Source, select **GitHub Actions**
2. Add a DNS CNAME record: `notes.masawada.me` → `masawada.github.io`
3. Open the vault in Obsidian, go to Settings → Community plugins → disable Restricted Mode → enable sync-notes
4. Configure an SSH key or credential helper for automatic pushes from Obsidian
