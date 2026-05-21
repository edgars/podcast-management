/**
 * Remove artefactos de build do Next (Windows/OneDrive: evita EINVAL readlink).
 * Uso: node scripts/clean-next.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const targets = [
  path.join(root, ".next"),
  path.join(root, ".next-local"),
  path.join(root, "node_modules", ".cache", "next-app"),
];

for (const dir of targets) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("Removido:", dir);
  } catch {
    // ignora se não existir
  }
}
