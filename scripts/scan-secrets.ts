
import * as fs from 'fs';
import * as path from 'path';

const SUSPICIOUS_PATTERNS = [
    { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
    { name: 'Private Key', regex: /-----BEGIN PRIVATE KEY-----/ },
    { name: 'Generic Secret', regex: /(api_key|apikey|secret|token).*=['"][a-zA-Z0-9_\-]{20,}['"]/i },
    { name: 'Database URL with Password', regex: /postgres:\/\/.*:.*@/ },
    { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/ },
];

const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.turbo'];
const IGNORED_FILES = ['package-lock.json', '.env', '.env.example', 'scan-secrets.ts', 'check-admin.ts', 'seed-databases.ts']; // .env is usually ignored by git, but if present locally we shouldn't fail build if it's there (unless we check for COMMITTED files, but plain scan is safer for local hooks)
const IGNORED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.pdf', '.lock', '.log'];

function scanFile(filePath: string): boolean {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        let hasSecret = false;

        // Check file size, skip if > 1MB
        if (fs.statSync(filePath).size > 1024 * 1024) return false;

        for (const pattern of SUSPICIOUS_PATTERNS) {
            if (pattern.regex.test(content)) {
                console.error(`[FAIL] Potential ${pattern.name} found in ${filePath}`);
                hasSecret = true;
            }
        }
        return hasSecret;
    } catch (error) {
        // Binary files or read errors
        return false;
    }
}

function walkDir(dir: string): boolean {
    let hasErrors = false;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (IGNORED_DIRS.includes(file)) continue;

        if (stat.isDirectory()) {
            if (walkDir(fullPath)) hasErrors = true;
        } else {
            if (IGNORED_FILES.includes(file)) continue;
            if (IGNORED_EXTENSIONS.some(ext => file.endsWith(ext))) continue;

            if (scanFile(fullPath)) hasErrors = true;
        }
    }
    return hasErrors;
}

console.log('Starting Secret Scan...');
const rootDir = process.cwd();
const failed = walkDir(rootDir);

if (failed) {
    console.error('Security Scan FAILED: Secrets found in codebase.');
    process.exit(1);
} else {
    console.log('Security Scan PASSED: No secrets found.');
    process.exit(0);
}
