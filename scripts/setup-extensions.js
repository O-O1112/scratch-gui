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

console.log('[setup-extensions] Done copying extensions to scratch-vm.');
