var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NoteSyncPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_child_process = require("child_process");
var import_util = require("util");
var execAsync = (0, import_util.promisify)(import_child_process.exec);
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"]);
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}
function getImageExtension(filename) {
  const parts = filename.split(".");
  if (parts.length < 2) return null;
  const ext = parts.pop().toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) ? ext : null;
}
function mimeToExt(mime) {
  var _a;
  const map = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/bmp": "bmp",
    "image/avif": "avif"
  };
  return (_a = map[mime]) != null ? _a : null;
}
var NoteSyncPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.syncTimer = null;
    this.isSyncing = false;
    this.needsResync = false;
  }
  async onload() {
    this.registerEvent(this.app.vault.on("modify", (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on("create", (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on("delete", (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on("rename", (file) => this.onFileChange(file)));
    this.registerEvent(
      this.app.workspace.on("editor-paste", (evt, editor) => {
        var _a;
        this.handleImageFiles((_a = evt.clipboardData) == null ? void 0 : _a.files, evt, editor);
      })
    );
    this.registerEvent(
      this.app.workspace.on("editor-drop", (evt, editor) => {
        var _a;
        this.handleImageFiles((_a = evt.dataTransfer) == null ? void 0 : _a.files, evt, editor);
      })
    );
  }
  onFileChange(file) {
    if (!file.path.startsWith("pages/") && !file.path.startsWith("images/")) return;
    this.scheduleSync();
  }
  scheduleSync() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.sync(), 1e4);
  }
  async sync() {
    if (this.isSyncing) {
      this.needsResync = true;
      return;
    }
    this.isSyncing = true;
    const basePath = this.app.vault.adapter.basePath;
    try {
      await execAsync("git add pages/ images/", { cwd: basePath });
      try {
        await execAsync("git diff --cached --quiet", { cwd: basePath });
        return;
      } catch (e) {
      }
      await execAsync('git commit -m "auto: update notes"', { cwd: basePath });
      try {
        await execAsync("git pull --rebase --autostash", { cwd: basePath });
      } catch (e) {
        await execAsync("git rebase --abort", { cwd: basePath }).catch(() => {
        });
        new import_obsidian.Notice("Sync: conflict detected \u2014 please resolve manually");
        return;
      }
      await execAsync("git push", { cwd: basePath });
      new import_obsidian.Notice("Notes synced");
    } catch (e) {
      console.error("note-sync:", e);
      new import_obsidian.Notice(`Sync failed: ${e.message}`);
    } finally {
      this.isSyncing = false;
      if (this.needsResync) {
        this.needsResync = false;
        this.scheduleSync();
      }
    }
  }
  async handleImageFiles(fileList, evt, editor) {
    if (!fileList || fileList.length === 0) return;
    const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    evt.preventDefault();
    for (const file of imageFiles) {
      await this.saveImage(file, editor);
    }
  }
  async saveImage(file, editor) {
    var _a, _b;
    const ext = (_b = (_a = getImageExtension(file.name)) != null ? _a : mimeToExt(file.type)) != null ? _b : "png";
    const uniqueName = `${generateId()}.${ext}`;
    const filePath = (0, import_obsidian.normalizePath)(`images/${uniqueName}`);
    const buffer = await file.arrayBuffer();
    await this.app.vault.createBinary(filePath, buffer);
    const cursor = editor.getCursor();
    editor.replaceRange(`![[${uniqueName}]]`, cursor);
  }
  onunload() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBFZGl0b3IsIE1hcmtkb3duVmlldywgVEFic3RyYWN0RmlsZSwgTm90aWNlLCBub3JtYWxpemVQYXRoIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJ1dGlsXCI7XG5cbmNvbnN0IGV4ZWNBc3luYyA9IHByb21pc2lmeShleGVjKTtcblxuY29uc3QgSU1BR0VfRVhURU5TSU9OUyA9IG5ldyBTZXQoW1wicG5nXCIsIFwianBnXCIsIFwianBlZ1wiLCBcImdpZlwiLCBcIndlYnBcIiwgXCJzdmdcIiwgXCJibXBcIiwgXCJhdmlmXCJdKTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICByZXR1cm4gRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTApO1xufVxuXG5mdW5jdGlvbiBnZXRJbWFnZUV4dGVuc2lvbihmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHBhcnRzID0gZmlsZW5hbWUuc3BsaXQoXCIuXCIpO1xuICBpZiAocGFydHMubGVuZ3RoIDwgMikgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGV4dCA9IHBhcnRzLnBvcCgpIS50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gSU1BR0VfRVhURU5TSU9OUy5oYXMoZXh0KSA/IGV4dCA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIG1pbWVUb0V4dChtaW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgbWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgIFwiaW1hZ2UvcG5nXCI6IFwicG5nXCIsXG4gICAgXCJpbWFnZS9qcGVnXCI6IFwianBnXCIsXG4gICAgXCJpbWFnZS9naWZcIjogXCJnaWZcIixcbiAgICBcImltYWdlL3dlYnBcIjogXCJ3ZWJwXCIsXG4gICAgXCJpbWFnZS9zdmcreG1sXCI6IFwic3ZnXCIsXG4gICAgXCJpbWFnZS9ibXBcIjogXCJibXBcIixcbiAgICBcImltYWdlL2F2aWZcIjogXCJhdmlmXCIsXG4gIH07XG4gIHJldHVybiBtYXBbbWltZV0gPz8gbnVsbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm90ZVN5bmNQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBwcml2YXRlIHN5bmNUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpc1N5bmNpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBuZWVkc1Jlc3luYyA9IGZhbHNlO1xuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAudmF1bHQub24oXCJtb2RpZnlcIiwgKGZpbGUpID0+IHRoaXMub25GaWxlQ2hhbmdlKGZpbGUpKSk7XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KHRoaXMuYXBwLnZhdWx0Lm9uKFwiY3JlYXRlXCIsIChmaWxlKSA9PiB0aGlzLm9uRmlsZUNoYW5nZShmaWxlKSkpO1xuICAgIHRoaXMucmVnaXN0ZXJFdmVudCh0aGlzLmFwcC52YXVsdC5vbihcImRlbGV0ZVwiLCAoZmlsZSkgPT4gdGhpcy5vbkZpbGVDaGFuZ2UoZmlsZSkpKTtcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAudmF1bHQub24oXCJyZW5hbWVcIiwgKGZpbGUpID0+IHRoaXMub25GaWxlQ2hhbmdlKGZpbGUpKSk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoXG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub24oXCJlZGl0b3ItcGFzdGVcIiwgKGV2dDogQ2xpcGJvYXJkRXZlbnQsIGVkaXRvcjogRWRpdG9yKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZGxlSW1hZ2VGaWxlcyhldnQuY2xpcGJvYXJkRGF0YT8uZmlsZXMsIGV2dCwgZWRpdG9yKTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKFwiZWRpdG9yLWRyb3BcIiwgKGV2dDogRHJhZ0V2ZW50LCBlZGl0b3I6IEVkaXRvcikgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZUltYWdlRmlsZXMoZXZ0LmRhdGFUcmFuc2Zlcj8uZmlsZXMsIGV2dCwgZWRpdG9yKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIG9uRmlsZUNoYW5nZShmaWxlOiBUQWJzdHJhY3RGaWxlKSB7XG4gICAgaWYgKCFmaWxlLnBhdGguc3RhcnRzV2l0aChcInBhZ2VzL1wiKSAmJiAhZmlsZS5wYXRoLnN0YXJ0c1dpdGgoXCJpbWFnZXMvXCIpKSByZXR1cm47XG4gICAgdGhpcy5zY2hlZHVsZVN5bmMoKTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVTeW5jKCkge1xuICAgIGlmICh0aGlzLnN5bmNUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuc3luY1RpbWVyKTtcbiAgICB0aGlzLnN5bmNUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zeW5jKCksIDEwXzAwMCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHN5bmMoKSB7XG4gICAgaWYgKHRoaXMuaXNTeW5jaW5nKSB7XG4gICAgICB0aGlzLm5lZWRzUmVzeW5jID0gdHJ1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmlzU3luY2luZyA9IHRydWU7XG4gICAgY29uc3QgYmFzZVBhdGggPSAodGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyBhbnkpLmJhc2VQYXRoIGFzIHN0cmluZztcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBleGVjQXN5bmMoXCJnaXQgYWRkIHBhZ2VzLyBpbWFnZXMvXCIsIHsgY3dkOiBiYXNlUGF0aCB9KTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZXhlY0FzeW5jKFwiZ2l0IGRpZmYgLS1jYWNoZWQgLS1xdWlldFwiLCB7IGN3ZDogYmFzZVBhdGggfSk7XG4gICAgICAgIHJldHVybjsgLy8gbm8gc3RhZ2VkIGNoYW5nZXNcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBub24temVybyBleGl0ID0gY2hhbmdlcyBleGlzdFxuICAgICAgfVxuXG4gICAgICBhd2FpdCBleGVjQXN5bmMoJ2dpdCBjb21taXQgLW0gXCJhdXRvOiB1cGRhdGUgbm90ZXNcIicsIHsgY3dkOiBiYXNlUGF0aCB9KTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZXhlY0FzeW5jKFwiZ2l0IHB1bGwgLS1yZWJhc2UgLS1hdXRvc3Rhc2hcIiwgeyBjd2Q6IGJhc2VQYXRoIH0pO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGF3YWl0IGV4ZWNBc3luYyhcImdpdCByZWJhc2UgLS1hYm9ydFwiLCB7IGN3ZDogYmFzZVBhdGggfSkuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgICBuZXcgTm90aWNlKFwiU3luYzogY29uZmxpY3QgZGV0ZWN0ZWQgXHUyMDE0IHBsZWFzZSByZXNvbHZlIG1hbnVhbGx5XCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IGV4ZWNBc3luYyhcImdpdCBwdXNoXCIsIHsgY3dkOiBiYXNlUGF0aCB9KTtcbiAgICAgIG5ldyBOb3RpY2UoXCJOb3RlcyBzeW5jZWRcIik7XG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwibm90ZS1zeW5jOlwiLCBlKTtcbiAgICAgIG5ldyBOb3RpY2UoYFN5bmMgZmFpbGVkOiAke2UubWVzc2FnZX1gKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5pc1N5bmNpbmcgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLm5lZWRzUmVzeW5jKSB7XG4gICAgICAgIHRoaXMubmVlZHNSZXN5bmMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZVN5bmMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGhhbmRsZUltYWdlRmlsZXMoXG4gICAgZmlsZUxpc3Q6IEZpbGVMaXN0IHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBldnQ6IENsaXBib2FyZEV2ZW50IHwgRHJhZ0V2ZW50LFxuICAgIGVkaXRvcjogRWRpdG9yLFxuICApIHtcbiAgICBpZiAoIWZpbGVMaXN0IHx8IGZpbGVMaXN0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IGltYWdlRmlsZXMgPSBBcnJheS5mcm9tKGZpbGVMaXN0KS5maWx0ZXIoKGYpID0+IGYudHlwZS5zdGFydHNXaXRoKFwiaW1hZ2UvXCIpKTtcbiAgICBpZiAoaW1hZ2VGaWxlcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBpbWFnZUZpbGVzKSB7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVJbWFnZShmaWxlLCBlZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc2F2ZUltYWdlKGZpbGU6IEZpbGUsIGVkaXRvcjogRWRpdG9yKSB7XG4gICAgY29uc3QgZXh0ID0gZ2V0SW1hZ2VFeHRlbnNpb24oZmlsZS5uYW1lKSA/PyBtaW1lVG9FeHQoZmlsZS50eXBlKSA/PyBcInBuZ1wiO1xuICAgIGNvbnN0IHVuaXF1ZU5hbWUgPSBgJHtnZW5lcmF0ZUlkKCl9LiR7ZXh0fWA7XG4gICAgY29uc3QgZmlsZVBhdGggPSBub3JtYWxpemVQYXRoKGBpbWFnZXMvJHt1bmlxdWVOYW1lfWApO1xuXG4gICAgY29uc3QgYnVmZmVyID0gYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpO1xuICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZUJpbmFyeShmaWxlUGF0aCwgYnVmZmVyKTtcblxuICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICBlZGl0b3IucmVwbGFjZVJhbmdlKGAhW1ske3VuaXF1ZU5hbWV9XV1gLCBjdXJzb3IpO1xuICB9XG5cbiAgb251bmxvYWQoKSB7XG4gICAgaWYgKHRoaXMuc3luY1RpbWVyKSBjbGVhclRpbWVvdXQodGhpcy5zeW5jVGltZXIpO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUFtRjtBQUNuRiwyQkFBcUI7QUFDckIsa0JBQTBCO0FBRTFCLElBQU0sZ0JBQVksdUJBQVUseUJBQUk7QUFFaEMsSUFBTSxtQkFBbUIsb0JBQUksSUFBSSxDQUFDLE9BQU8sT0FBTyxRQUFRLE9BQU8sUUFBUSxPQUFPLE9BQU8sTUFBTSxDQUFDO0FBRTVGLFNBQVMsYUFBcUI7QUFDNUIsU0FBTyxLQUFLLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxVQUFVLEdBQUcsRUFBRTtBQUM3RTtBQUVBLFNBQVMsa0JBQWtCLFVBQWlDO0FBQzFELFFBQU0sUUFBUSxTQUFTLE1BQU0sR0FBRztBQUNoQyxNQUFJLE1BQU0sU0FBUyxFQUFHLFFBQU87QUFDN0IsUUFBTSxNQUFNLE1BQU0sSUFBSSxFQUFHLFlBQVk7QUFDckMsU0FBTyxpQkFBaUIsSUFBSSxHQUFHLElBQUksTUFBTTtBQUMzQztBQUVBLFNBQVMsVUFBVSxNQUE2QjtBQW5CaEQ7QUFvQkUsUUFBTSxNQUE4QjtBQUFBLElBQ2xDLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLGlCQUFpQjtBQUFBLElBQ2pCLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxFQUNoQjtBQUNBLFVBQU8sU0FBSSxJQUFJLE1BQVIsWUFBYTtBQUN0QjtBQUVBLElBQXFCLGlCQUFyQixjQUE0Qyx1QkFBTztBQUFBLEVBQW5EO0FBQUE7QUFDRSxTQUFRLFlBQWtEO0FB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
