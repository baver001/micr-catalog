const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const WRANGLER_TOML_PATH = path.join(ROOT_DIR, 'wrangler.toml');

// Colors
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m"
};

function log(msg, type = 'info') {
    const prefix = {
        info: `${colors.blue}[INFO]${colors.reset}`,
        success: `${colors.green}[SUCCESS]${colors.reset}`,
        warn: `${colors.yellow}[WARN]${colors.reset}`,
        error: `${colors.red}[ERROR]${colors.reset}`,
        step: `${colors.cyan}[STEP]${colors.reset}`
    };
    console.log(`${prefix[type]} ${msg}`);
}

function runCommand(command, options = {}) {
    try {
        log(`Running: ${command}`, 'step');
        execSync(command, { stdio: 'inherit', cwd: ROOT_DIR, ...options });
        return true;
    } catch (error) {
        log(`Command failed: ${command}`, 'error');
        return false;
    }
}

function runCommandWithOutput(command) {
    try {
        return execSync(command, { encoding: 'utf8', cwd: ROOT_DIR }).trim();
    } catch (error) {
        return null;
    }
}

async function main() {
    console.log(`
${colors.bright}${colors.cyan}==========================================
   micr.fun Auto-Setup & Deploy Script
==========================================${colors.reset}
`);

    // 1. Check/Install Wrangler
    log("Checking Wrangler...", 'info');
    let wranglerCmd = 'npx wrangler';

    // Test if npx works
    try {
        execSync('npx --version', { stdio: 'ignore' });
    } catch (e) {
        log("npx is not available. Please install Node.js properly.", 'error');
        process.exit(1);
    }

    // 2. Login to Cloudflare
    log("Checking Cloudflare authentication...", 'info');
    try {
        execSync(`${wranglerCmd} whoami`, { stdio: 'ignore', cwd: ROOT_DIR });
        log("Already logged in!", 'success');
    } catch (e) {
        log("Please log in to Cloudflare in the browser window that opens...", 'warn');
        runCommand(`${wranglerCmd} login`);
    }

    // 3. Create D1 Database
    log("Setting up D1 Database...", 'info');

    // Check if ID is already in toml
    let tomlContent = fs.readFileSync(WRANGLER_TOML_PATH, 'utf8');
    const idMatch = tomlContent.match(/database_id\s*=\s*"([^"]+)"/);

    let dbId = idMatch && idMatch[1] ? idMatch[1] : null;

    if (dbId) {
        log(`Database ID found in config: ${dbId}`, 'info');
    } else {
        log("Creating new D1 database 'micr-db'...", 'step');
        // Try create
        let createOutput;
        try {
            createOutput = execSync(`${wranglerCmd} d1 create micr-db`, { encoding: 'utf8', cwd: ROOT_DIR });
        } catch (e) {
            // Maybe it already exists?
            log("Database might already exist, trying to fetch info...", 'warn');
            const listOutput = runCommandWithOutput(`${wranglerCmd} d1 list`);
            const match = listOutput.match(/micr-db\s+([0-9a-f-]+)/);
            if (match) {
                dbId = match[1];
            }
        }

        // Parse creation output if we created it
        if (!dbId && createOutput) {
            const match = createOutput.match(/database_id\s*=\s*"([0-9a-f-]+)"/);
            if (match) dbId = match[1];
        }

        if (dbId) {
            log(`Database ID acquired: ${dbId}`, 'success');
            // Update toml
            tomlContent = tomlContent.replace(/database_id\s*=\s*""/, `database_id = "${dbId}"`);
            fs.writeFileSync(WRANGLER_TOML_PATH, tomlContent);
            log("Updated wrangler.toml with database ID", 'success');
        } else {
            log("Could not find or create database ID. Please check Cloudflare dashboard.", 'error');
            process.exit(1);
        }
    }

    // 4. Apply Schema & Seed
    log("Applying database schema...", 'info');
    runCommand(`${wranglerCmd} d1 execute micr-db --file=worker/schema.sql --yes`);

    log("Seeding database...", 'info');
    // Check if empty first to avoid duplicates? Or blindly insert (might fail unique constraints but that's ok)
    try {
        runCommand(`${wranglerCmd} d1 execute micr-db --file=worker/seed.sql --yes`);
    } catch (e) {
        log("Seed data might already exist (ignoring error)", 'warn');
    }

    // 5. Deploy Worker
    log("Deploying Worker to Cloudflare...", 'step');
    if (runCommand(`${wranglerCmd} deploy`)) {
        log("Worker deployed successfully!", 'success');
    } else {
        log("Worker deployment failed", 'error');
        process.exit(1);
    }

    // 6. Netlify Deploy
    log("Proceeding to Frontend deployment...", 'info');

    log("Building frontend...", 'step');
    if (!runCommand('npm run build')) {
        log("Build failed", 'error');
        process.exit(1);
    }

    // Check availability of netlify-cli
    log("Deploying to Netlify...", 'step');
    const hasNetlify = runCommandWithOutput('npx netlify --version');
    if (hasNetlify) {
        // Try deploy
        try {
            // Interactive login might be needed if not logged in
            // We use 'call' to let it take over stdio
            log("If asked, please authorize Netlify...", 'warn');
            runCommand('npx netlify deploy --prod');
            log("Frontend deployed!", 'success');
        } catch (e) {
            log("Netlify deploy failed. Try running 'npx netlify deploy --prod' manually.", 'error');
        }
    } else {
        log("Netlify CLI not found. Skipping Netlify deploy.", 'warn');
    }

    console.log(`
${colors.bright}${colors.green}==========================================
      SETUP & DEPLOYMENT COMPLETE!
==========================================${colors.reset}

Your API should be running at: https://api.micr.fun/api/apps
Your Frontend should be running at: https://micr.fun (if configured in Netlify)

${colors.yellow}Next Steps:${colors.reset}
1. Check DNS records in Cloudflare Dashboard:
   - CNAME 'api' -> [worker-subdomain].workers.dev
`);
}

main();
