# 🚀 Bun Setup Guide for Vanitya

This project uses **Bun** as the JavaScript runtime and package manager for faster performance.

## Why Bun?

- ⚡ **10-100x faster** than npm/yarn for package installation
- 🚀 **Native TypeScript support** - no need for ts-node
- 📦 **Built-in bundler** and test runner
- 🔥 **Faster runtime** performance
- 🎯 **Drop-in replacement** for Node.js

## Installation

### 1. Install Bun

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (WSL):**
```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Or use npm (temporary):**
```bash
npm install -g bun
```

### 2. Verify Installation

```bash
bun --version
# Should show: bun 1.x.x
```

## Project Setup

### 1. Install Dependencies

```bash
# Install all dependencies (much faster than npm!)
bun install
```

### 2. Run Development Server

```bash
# Using NestJS CLI
bun run start:dev

# Or directly with Bun (even faster!)
bun src/main.ts
```

### 3. Run Tests

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# With coverage
bun test --coverage
```

## Bun Commands Reference

### Package Management

```bash
# Install package
bun add <package-name>

# Install dev dependency
bun add -d <package-name>

# Remove package
bun remove <package-name>

# Update packages
bun update
```

### Running Scripts

```bash
# Run any script from package.json
bun run <script-name>

# Run TypeScript files directly
bun src/main.ts

# Run with environment variables
bun --env-file=.env src/main.ts
```

### Development

```bash
# Start dev server
bun run start:dev

# Build for production
bun run build

# Start production server
bun run start:prod

# Lint code
bun run lint

# Format code
bun run format
```

### Database

```bash
# Run migrations
bun run migration:run

# Generate migration
bun run migration:generate -- -n MigrationName

# Revert migration
bun run migration:revert
```

## Performance Benefits

### Package Installation Speed

```bash
# npm: ~30-60 seconds
npm install

# bun: ~2-5 seconds ⚡
bun install
```

### Runtime Performance

- Bun's runtime is optimized for speed
- Native TypeScript execution (no compilation step needed)
- Faster module resolution
- Better memory management

## Migration from npm

If you're migrating from npm:

1. **Remove node_modules and lock files:**
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Install with Bun:**
   ```bash
   bun install
   ```

3. **Update scripts** (already done in package.json):
   - `npm run` → `bun run`
   - `npm test` → `bun test`
   - `npx` → `bunx`

## Configuration

The project includes `bunfig.toml` for Bun-specific configuration:

- Auto-install peer dependencies
- Cache settings
- Test configuration

## Troubleshooting

### Bun not found

```bash
# Add to PATH (usually automatic)
export PATH="$HOME/.bun/bin:$PATH"

# Or restart terminal
```

### Permission issues

```bash
# Fix permissions
chmod +x ~/.bun/bin/bun
```

### TypeScript errors

Bun has native TypeScript support, but if you see errors:

```bash
# Clear cache
bun install --force

# Rebuild
bun run build
```

## Benefits for This Project

1. **Faster Development**: Instant TypeScript execution
2. **Quick Installations**: Dependencies install in seconds
3. **Better DX**: No need for ts-node or additional tooling
4. **Production Ready**: Bun can run production builds efficiently

## Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [Bun GitHub](https://github.com/oven-sh/bun)
- [Bun vs Node.js](https://bun.sh/docs/runtime/nodejs)

---

**Happy coding with Bun! 🚀**

