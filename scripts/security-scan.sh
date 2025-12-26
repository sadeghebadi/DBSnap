#!/bin/bash
set -e

echo "🔒 Starting Security Scan..."

# 1. NPM Audit
echo "📦 Running npm audit..."
npm audit --production || echo "⚠️  Vulnerabilities found!"

# 2. Secret Scanning (Placeholder - e.g. using gitleaks in real CI)
echo "🔑 Scanning for secrets..."
grep -r "API_KEY" . --exclude-dir=node_modules && echo "⚠️  Potential secrets found!" || echo "✅ No obvious secrets found."

echo "✅ Security Scan Complete."
