/**
 * Script de build Electron
 * 1. Vide .next/ pour forcer une recompilation propre
 * 2. Cache app/api temporairement (incompatible avec output:export)
 * 3. Lance next build static
 * 4. Restaure app/api
 * 5. Lance electron-builder
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const apiDir = path.join(root, "app", "api");
const apiBackup = path.join(root, ".api-backup");
const nextCache = path.join(root, ".next");
const platform = process.argv[2] || "win";

console.log("\n🔧 Build Electron — static export\n");

// 1. Vider le cache Next.js
if (fs.existsSync(nextCache)) {
  fs.rmSync(nextCache, { recursive: true, force: true });
  console.log("✓ Cache .next/ vidé");
}

// 2. Cacher app/api
if (fs.existsSync(apiDir)) {
  fs.renameSync(apiDir, apiBackup);
  console.log("✓ app/api mis de côté");
}

let buildOk = false;
try {
  // 3. Build Next.js static
  console.log("\n📦 next build (static export)...");
  execSync("npx next build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "electron", NODE_ENV: "production" },
  });
  console.log("\n✓ Build Next.js OK → dossier out/\n");
  buildOk = true;

} finally {
  // 4. Toujours restaurer app/api
  if (fs.existsSync(apiBackup)) {
    fs.renameSync(apiBackup, apiDir);
    console.log("✓ app/api restauré");
  }
}

if (!buildOk) {
  console.error("❌ Build Next.js échoué — electron-builder annulé");
  process.exit(1);
}

// 5. electron-builder
const target = platform === "linux" ? "--linux"
  : platform === "mac" ? "--mac"
  : "--win --x64";

console.log(`\n🖥  electron-builder ${target}...\n`);
execSync(`npx electron-builder ${target} --publish never`, {
  cwd: root,
  stdio: "inherit",
});
console.log("\n✅ Build terminé — voir dist-electron/\n");
