#!/bin/bash
set -e

echo "🔒 Starting Security Scan..."

# 1. Dependency Audit
echo "📦 Running npm audit..."
npm audit --audit-level=high

# 2. Secret Scanning
echo "🕵️  Scanning for secrets..."
npx ts-node scripts/scan-secrets.ts

echo "✅ All security checks passed!"
