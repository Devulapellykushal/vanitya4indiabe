# 🚀 Quick Start Guide

## Issue: Script not found

If you're getting `error: Script not found "start:dev"`, you're likely in the wrong directory or need to install dependencies.

## ✅ Solution

### Step 1: Go to Project Root
```bash
# Make sure you're in the root directory (not in src/)
cd /Users/devulapellykushalkumarreddy/Vanitya
# or just
cd ..
```

### Step 2: Install NestJS Dependencies
```bash
# Install all NestJS dependencies
bun install
```

### Step 3: Install NestJS CLI (if needed)
```bash
# Install NestJS CLI globally
bun add -g @nestjs/cli

# Or use bunx for one-time commands
bunx @nestjs/cli
```

### Step 4: Run the Application
```bash
# From the root directory
bun run start:dev

# Or directly with Bun (faster, no NestJS CLI needed)
bun src/main.ts
```

## 📁 Directory Structure

```
Vanitya/                    ← You need to be HERE (root)
├── package.json           ← Scripts are defined here
├── src/
│   ├── main.ts           ← Entry point
│   └── ...
└── ...
```

## 🔧 Common Issues

### Issue 1: "Script not found"
**Cause**: You're in the wrong directory (e.g., `src/`)  
**Fix**: `cd ..` to go to root directory

### Issue 2: "Module not found"
**Cause**: Dependencies not installed  
**Fix**: `bun install` from root directory

### Issue 3: "nest: command not found"
**Cause**: NestJS CLI not installed  
**Fix**: `bun add -g @nestjs/cli` or use `bunx @nestjs/cli`

### Issue 4: TypeScript errors
**Cause**: TypeScript not configured or dependencies missing  
**Fix**: 
```bash
bun install
bun run build
```

## ✅ Verification

Check you're in the right place:
```bash
# Should show package.json
ls package.json

# Should show src/ directory
ls src/
```

Then run:
```bash
bun run start:dev
```

## 🎯 Expected Output

```
🚀 Vanitya Backend API server running:
   URL: http://0.0.0.0:3000
   Environment: development
   Health Check: http://0.0.0.0:3000/api/v1/health
   API Docs: http://0.0.0.0:3000/api/docs
```

---

**Remember**: Always run commands from the **root directory** where `package.json` is located!

