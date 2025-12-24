#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SOURCE_FILE = path.join(process.cwd(), "ISSUE_MASTER.md");
const OUTPUT_DIR = path.join(process.cwd(), "issues");

if (!fs.existsSync(SOURCE_FILE)) {
    console.error("❌ ISSUE_MASTER.md not found");
    process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const content = fs.readFileSync(SOURCE_FILE, "utf-8");

// Split by issue headers
const issueBlocks = content.split(/^### /gm).slice(1);

issueBlocks.forEach(block => {
    const lines = block.trim().split("\n");
    const titleLine = lines[0]; // ISSUE-001 — Repo Bootstrap

    const match = titleLine.match(/(ISSUE-\d+)/);
    if (!match) return;

    const issueId = match[1];
    const safeTitle = titleLine
        .toLowerCase()
        .replace(/—/g, "-")
        .replace(/[^a-z0-9\- ]/g, "")
        .replace(/\s+/g, "-");

    const filename = `${issueId}-${safeTitle.replace(`${issueId.toLowerCase()}-`, "")}.md`;
    const filePath = path.join(OUTPUT_DIR, filename);

    const fileContent = `### ${block.trim()}\n`;

    fs.writeFileSync(filePath, fileContent);
    console.log(`✅ Created ${filename}`);
});

console.log("\n🎉 Issues successfully split into /issues");
