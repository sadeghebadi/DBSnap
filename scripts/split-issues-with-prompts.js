#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SOURCE_FILE = path.join(process.cwd(), "ISSUE_MASTER.md");
const OUTPUT_DIR = path.join(process.cwd(), "readyToDev");

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

    const filename = `${issueId}---${safeTitle.replace(`${issueId.toLowerCase()}-`, "")}.md`;
    const filePath = path.join(OUTPUT_DIR, filename);

    // Compose the prompt inside the file
    const promptContent = `# ${titleLine}

## Goal / Requirements / Acceptance Criteria / Out of Scope

${block.trim()}

## AI Instructions for Gemini

You are an expert software engineer. You have the DBSnap README.md and ISSUE_MASTER.md as references.

Do NOT invent new features. Follow the frozen MVP scope strictly.

Instructions:
1. Read this file completely.
2. **Git Workflow**:
   - Implement the requirements.
   - Commit and push the branch main.
   - Copy this task file from \`readyToDev/\` to \`issues_done/\`.
3. Follow Goal, Requirements, Acceptance Criteria, and Out of Scope.
4. Prepare a folder / file structure and placeholder code (if applicable) for this issue.
5. Do NOT start coding other features beyond the scope of this issue.
6. Provide outputs in a format ready for direct commit or review.

Reply ONLY with the code/files/folder structure relevant to this Issue.

`;

    fs.writeFileSync(filePath, promptContent);
    console.log(`✅ Created ${filename}`);
});

console.log("\n🎉 All issues are now prepared in /readyToDev with AI prompts!");
