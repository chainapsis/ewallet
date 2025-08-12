#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, "../dist");

function addExtensions(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");

  // Handle export statements
  let updatedContent = content.replace(
    /export\s+\*\s+from\s+['"](\.\/[^'"]*?)['"]/g,
    (match, exportPath) => {
      if (exportPath.endsWith(".js")) {
        return match;
      }
      const fullPath = path.join(path.dirname(filePath), exportPath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        return `export * from '${exportPath}/index.js'`;
      }
      return `export * from '${exportPath}.js'`;
    },
  );

  // Handle import statements
  updatedContent = updatedContent.replace(
    /import\s+.*?\s+from\s+['"](\.\/[^'"]*?)['"]/g,
    (match, importPath) => {
      if (importPath.endsWith(".js")) {
        return match;
      }
      const fullPath = path.join(path.dirname(filePath), importPath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        return match.replace(importPath, `${importPath}/index.js`);
      }
      return match.replace(importPath, `${importPath}.js`);
    },
  );

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith(".js")) {
      addExtensions(filePath);
    }
  }
}

console.log("🔧 Adding .js extensions to relative imports...");
processDirectory(distDir);
console.log("✨ Done!");
