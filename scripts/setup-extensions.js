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
copyDirSync(
    path.join(extensionsVmDir, 'scratch3_handpose2scratch'),
    path.join(vmDir, 'src', 'extensions', 'scratch3_handpose2scratch')
);
copyDirSync(
    path.join(extensionsVmDir, 'scratch3_facemesh2scratch'),
    path.join(vmDir, 'src', 'extensions', 'scratch3_facemesh2scratch')
);
copyDirSync(
    path.join(extensionsVmDir, 'scratch3_ml2scratch'),
    path.join(vmDir, 'src', 'extensions', 'scratch3_ml2scratch')
);
copyDirSync(
    path.join(extensionsVmDir, 'scratch3_console'),
    path.join(vmDir, 'src', 'extensions', 'scratch3_console')
);
copyDirSync(
    path.join(extensionsVmDir, 'scratch3_custom'),
    path.join(vmDir, 'src', 'extensions', 'scratch3_custom')
);
copyDirSync(
    path.join(extensionsVmDir, 'scratch3_cursor'),
    path.join(vmDir, 'src', 'extensions', 'scratch3_cursor')
);
copyDirSync(
    path.join(extensionsVmDir, 'scratch3_storage'),
    path.join(vmDir, 'src', 'extensions', 'scratch3_storage')
);

fs.copyFileSync(
    path.join(extensionsVmDir, 'extension-manager.js'),
    path.join(vmDir, 'src', 'extension-support', 'extension-manager.js')
);

console.log('[setup-extensions] Done copying extensions to scratch-vm.');
