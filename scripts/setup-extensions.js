const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const vmDir = path.resolve(rootDir, 'node_modules', 'scratch-vm');
const extensionsVmDir = path.resolve(rootDir, 'extensions-vm');

if (!fs.existsSync(vmDir)) {
    console.log('[setup-extensions] scratch-vm not found in node_modules, skipping.');
    process.exit(0);
}

function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, {recursive: true});
    }
    const entries = fs.readdirSync(src, {withFileTypes: true});
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('[setup-extensions] Copying extensions to scratch-vm...');

const extensionEntries = fs.readdirSync(extensionsVmDir, {withFileTypes: true});
for (const entry of extensionEntries) {
    if (entry.isDirectory() && entry.name.startsWith('scratch3_')) {
        console.log(`[setup-extensions] Syncing ${entry.name}...`);
        copyDirSync(
            path.join(extensionsVmDir, entry.name),
            path.join(vmDir, 'src', 'extensions', entry.name)
        );
    }
}

fs.copyFileSync(
    path.join(extensionsVmDir, 'extension-manager.js'),
    path.join(vmDir, 'src', 'extension-support', 'extension-manager.js')
);

// Patch scratch-vm package.json so that browser / exports resolve to src/index.js
const vmPkgPath = path.join(vmDir, 'package.json');
if (fs.existsSync(vmPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(vmPkgPath, 'utf8'));
    pkg.main = './src/index.js';
    pkg.browser = './src/index.js';
    pkg.exports = {
        webpack: './src/index.js',
        browser: './src/index.js',
        node: './src/index.js',
        default: './src/index.js'
    };
    fs.writeFileSync(vmPkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log('[setup-extensions] Patched scratch-vm package.json entry points to src/index.js');
}

// Patch runtime.js getBlocksXML to escape category names
const runtimePath = path.join(vmDir, 'src', 'engine', 'runtime.js');
if (fs.existsSync(runtimePath)) {
    let runtimeCode = fs.readFileSync(runtimePath, 'utf8');
    if (runtimeCode.includes('xml: `<category name="${name}"') && !runtimeCode.includes('escapedName')) {
        runtimeCode = runtimeCode.replace(
            'return {\n                id: categoryInfo.id,\n                xml: `<category name="${name}"',
            'const escapedName = typeof name === "string" ? name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : name;\n            return {\n                id: categoryInfo.id,\n                xml: `<category name="${escapedName}"'
        );
        fs.writeFileSync(runtimePath, runtimeCode, 'utf8');
        console.log('[setup-extensions] Patched runtime.js to escape category names in getBlocksXML');
    }
}

console.log('[setup-extensions] Done copying extensions to scratch-vm.');
