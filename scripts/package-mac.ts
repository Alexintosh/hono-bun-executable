import fs from 'node:fs/promises';
import path from 'node:path';

// --- Configuration ---
const appName = 'MyApp'; // Choose your app name
const version = '1.0.0';
const bundleId = `com.yourcompany.${appName.toLowerCase().replace(/\s+/g, '')}`;
const executableName = 'myapp'; // The name of your compiled Bun executable
const iconName = 'AppIcon.icns'; // Must be a .icns file

const projectRoot = path.resolve(import.meta.dir, '..'); // Assumes script is in 'scripts/' directory
const distDir = path.join(projectRoot, 'dist');
const assetsDir = path.join(projectRoot, 'assets'); // Directory for icon and potentially other assets

const buildPaths = {
    executable: path.join(distDir, executableName),
    publicDir: path.join(distDir, 'app'),
    icon: path.join(assetsDir, iconName),
    outputApp: path.join(distDir, `${appName}.app`),
};

const bundlePaths = {
    base: buildPaths.outputApp,
    contents: path.join(buildPaths.outputApp, 'Contents'),
    macOS: path.join(buildPaths.outputApp, 'Contents', 'MacOS'),
    resources: path.join(buildPaths.outputApp, 'Contents', 'Resources'),
    infoPlist: path.join(buildPaths.outputApp, 'Contents', 'Info.plist'),
    executable: path.join(buildPaths.outputApp, 'Contents', 'MacOS', executableName),
    icon: path.join(buildPaths.outputApp, 'Contents', 'Resources', iconName),
    publicDir: path.join(buildPaths.outputApp, 'Contents', 'Resources', 'app'),
};

// --- Helper Functions ---

async function ensureDirExists(dirPath: string): Promise<void> {
    try {
        await fs.access(dirPath);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`Created directory: ${dirPath}`);
        } else {
            throw error;
        }
    }
}

async function copyFile(src: string, dest: string): Promise<void> {
    try {
        await fs.copyFile(src, dest);
        console.log(`Copied file: ${src} -> ${dest}`);
    } catch (error: any) {
        console.error(`Error copying file ${src} to ${dest}:`, error);
        throw error;
    }
}

async function copyDirRecursive(src: string, dest: string): Promise<void> {
    try {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                await copyDirRecursive(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
        console.log(`Copied directory: ${src} -> ${dest}`);
    } catch (error: any) {
        console.error(`Error copying directory ${src} to ${dest}:`, error);
        throw error;
    }
}

function generateInfoPlist(): string {
    // Basic Info.plist content
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>${executableName}</string>
    <key>CFBundleIconFile</key>
    <string>${iconName}</string>
    <key>CFBundleIdentifier</key>
    <string>${bundleId}</string>
    <key>CFBundleName</key>
    <string>${appName}</string>
    <key>CFBundleDisplayName</key>
    <string>${appName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${version}</string>
    <key>CFBundleVersion</key>
    <string>${version}</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.12.0</string> <!-- Example: macOS Sierra -->
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © ${new Date().getFullYear()} Your Company. All rights reserved.</string>
    <!-- Add other necessary keys as needed -->
</dict>
</plist>`;
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// --- Main Packaging Logic ---

async function packageApp() {
    console.log(`Starting macOS packaging for ${appName}...`);

    // 1. Prerequisites check
    if (!(await fileExists(buildPaths.executable))) {
        console.error(`Error: Executable not found at ${buildPaths.executable}. Run 'make compile' first.`);
        process.exit(1);
    }
    if (!(await fileExists(buildPaths.publicDir))) {
        console.error(`Error: Public directory not found at ${buildPaths.publicDir}. Run 'make build-app' first.`);
        process.exit(1);
    }
     if (!(await fileExists(buildPaths.icon))) {
        console.warn(`Warning: Icon file not found at ${buildPaths.icon}. Using default icon. Create 'assets/${iconName}' for a custom icon.`);
        // App will still be created, but use the default system icon
    } else {
        console.log(`Using icon: ${buildPaths.icon}`);
    }

    // 2. Clean previous build
    console.log(`Cleaning previous build: ${buildPaths.outputApp}`);
    await fs.rm(buildPaths.outputApp, { recursive: true, force: true });

    // 3. Create bundle structure
    console.log('Creating bundle structure...');
    await ensureDirExists(bundlePaths.base);
    await ensureDirExists(bundlePaths.contents);
    await ensureDirExists(bundlePaths.macOS);
    await ensureDirExists(bundlePaths.resources);

    // 4. Copy executable
    console.log('Copying executable...');
    await copyFile(buildPaths.executable, bundlePaths.executable);
    await fs.chmod(bundlePaths.executable, 0o755); // Ensure it's executable

    // 5. Copy public directory
    console.log('Copying public directory...');
    await copyDirRecursive(buildPaths.publicDir, bundlePaths.publicDir);

    // 6. Copy icon (if it exists)
    if (await fileExists(buildPaths.icon)) {
        console.log('Copying icon...');
        await copyFile(buildPaths.icon, bundlePaths.icon);
    } else {
        console.log('Skipping icon copy (not found).');
    }


    // 7. Create Info.plist
    console.log('Generating Info.plist...');
    const infoPlistContent = generateInfoPlist();
    await fs.writeFile(bundlePaths.infoPlist, infoPlistContent, 'utf-8');
    console.log(`Created Info.plist: ${bundlePaths.infoPlist}`);

    console.log('-------------------------------------');
    console.log(`✅ macOS app bundle created successfully at: ${buildPaths.outputApp}`);
    console.log('-------------------------------------');
}

// --- Run the script ---
packageApp().catch(error => {
    console.error("Packaging failed:", error);
    process.exit(1);
}); 