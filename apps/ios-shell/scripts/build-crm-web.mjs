import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(mobileRoot, "..", "..");
const sourceFile = path.join(repoRoot, "apps", "crm", "src", "crm-app.jsx");
const webBundlePath = path.join(repoRoot, "crm", "crm-app.js");

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

console.log("Built TYFYS CRM bundle.");
