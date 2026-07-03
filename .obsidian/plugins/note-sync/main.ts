import { Plugin, Editor, MarkdownView, TAbstractFile, Notice, normalizePath } from "obsidian";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"]);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

function getImageExtension(filename: string): string | null {
  const parts = filename.split(".");
  if (parts.length < 2) return null;
  const ext = parts.pop()!.toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) ? ext : null;
}

function mimeToExt(mime: string): string | null {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/bmp": "bmp",
    "image/avif": "avif",
  };
  return map[mime] ?? null;
}

export default class NoteSyncPlugin extends Plugin {
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private isSyncing = false;
  private needsResync = false;

  async onload() {
    this.registerEvent(this.app.vault.on("modify", (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on("create", (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on("delete", (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on("rename", (file) => this.onFileChange(file)));

    this.registerEvent(
      this.app.workspace.on("editor-paste", (evt: ClipboardEvent, editor: Editor) => {
        this.handleImageFiles(evt.clipboardData?.files, evt, editor);
      }),
    );
    this.registerEvent(
      this.app.workspace.on("editor-drop", (evt: DragEvent, editor: Editor) => {
        this.handleImageFiles(evt.dataTransfer?.files, evt, editor);
      }),
    );
  }

  private onFileChange(file: TAbstractFile) {
    if (!file.path.startsWith("pages/") && !file.path.startsWith("images/")) return;
    this.scheduleSync();
  }

  private scheduleSync() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.sync(), 10_000);
  }

  private async sync() {
    if (this.isSyncing) {
      this.needsResync = true;
      return;
    }

    this.isSyncing = true;
    const basePath = (this.app.vault.adapter as any).basePath as string;

    try {
      await execAsync("git add pages/ images/", { cwd: basePath });

      try {
        await execAsync("git diff --cached --quiet", { cwd: basePath });
        return; // no staged changes
      } catch {
        // non-zero exit = changes exist
      }

      await execAsync('git commit -m "auto: update notes"', { cwd: basePath });

      try {
        await execAsync("git pull --rebase --autostash", { cwd: basePath });
      } catch {
        await execAsync("git rebase --abort", { cwd: basePath }).catch(() => {});
        new Notice("Sync: conflict detected — please resolve manually");
        return;
      }

      await execAsync("git push", { cwd: basePath });
      new Notice("Notes synced");
    } catch (e: any) {
      console.error("note-sync:", e);
      new Notice(`Sync failed: ${e.message}`);
    } finally {
      this.isSyncing = false;
      if (this.needsResync) {
        this.needsResync = false;
        this.scheduleSync();
      }
    }
  }

  private async handleImageFiles(
    fileList: FileList | undefined | null,
    evt: ClipboardEvent | DragEvent,
    editor: Editor,
  ) {
    if (!fileList || fileList.length === 0) return;
    const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    evt.preventDefault();
    for (const file of imageFiles) {
      await this.saveImage(file, editor);
    }
  }

  private async saveImage(file: File, editor: Editor) {
    const ext = getImageExtension(file.name) ?? mimeToExt(file.type) ?? "png";
    const uniqueName = `${generateId()}.${ext}`;
    const filePath = normalizePath(`images/${uniqueName}`);

    const buffer = await file.arrayBuffer();
    await this.app.vault.createBinary(filePath, buffer);

    const cursor = editor.getCursor();
    editor.replaceRange(`![[${uniqueName}]]`, cursor);
  }

  onunload() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
  }
}
