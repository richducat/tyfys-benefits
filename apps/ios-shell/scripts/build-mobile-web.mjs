import { build } from "esbuild";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(mobileRoot, "..", "..");
const sourceFile = path.join(repoRoot, "apps", "tyfys-platform", "src", "tyfys-platform-app.jsx");
const webBundlePath = path.join(repoRoot, "tyfys-platform", "tyfys-platform-app.js");
const mobilePlatformDir = path.join(mobileRoot, "www", "tyfys-platform");
const mobileVendorDir = path.join(mobilePlatformDir, "vendor");

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyFile(sourcePath, targetPath) {
  await ensureDir(path.dirname(targetPath));
  await fs.copyFile(sourcePath, targetPath);
}

async function assertCriticalCssUtilities(cssPath) {
  const css = await fs.readFile(cssPath, "utf8");
  const requiredSelectors = [
    ".rounded-\\[1\\.75rem\\]",
    ".h-\\[44rem\\]",
    ".min-h-\\[44rem\\]"
  ];

  for (const selector of requiredSelectors) {
    if (!css.includes(selector)) {
      throw new Error(`Shared app CSS is missing required utility ${selector}`);
    }
  }
}

await ensureDir(mobileVendorDir);

await build({
  entryPoints: [sourceFile],
  outfile: webBundlePath,
  bundle: true,
  loader: { ".jsx": "jsx" },
  jsx: "transform",
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  legalComments: "none",
});

await assertCriticalCssUtilities(path.join(repoRoot, "tyfys-platform", "app-tailwind.css"));

await Promise.all([
  copyFile(webBundlePath, path.join(mobilePlatformDir, "tyfys-platform-app.js")),
  copyFile(path.join(repoRoot, "tyfys-platform", "app-tailwind.css"), path.join(mobilePlatformDir, "app-tailwind.css")),
  copyFile(
    path.join(repoRoot, "tyfys-platform", "vendor", "react.production.min.js"),
    path.join(mobileVendorDir, "react.production.min.js")
  ),
  copyFile(
    path.join(repoRoot, "tyfys-platform", "vendor", "react-dom.production.min.js"),
    path.join(mobileVendorDir, "react-dom.production.min.js")
  ),
]);

console.log("Built TYFYS platform bundle for web and mobile.");
