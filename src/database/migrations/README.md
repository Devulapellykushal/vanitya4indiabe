# TypeORM Migrations

## Current Status

The project has been migrated from Sequelize to TypeORM. The existing `.js` migration files are **Sequelize migrations** and are kept for reference.

## TypeORM Migration Setup

### Generate Initial Migration

Since the database schema is already created via `synchronize: true` in development, you can generate an initial migration from the current entities:

```bash
# Generate migration from entities (creates a snapshot)
bun run migration:generate -- src/database/migrations/InitialSchema

# Or create an empty migration
bun run migration:create -- src/database/migrations/YourMigrationName
```

### Run Migrations

```bash
# Run all pending migrations
bun run migration:run

# Show migration status
bun run migration:show

# Revert last migration
bun run migration:revert
```

## Migration Workflow

1. **Development**: Use `synchronize: true` (auto-sync from entities)
2. **Before Production**: Generate migration from entities
3. **Production**: Use `synchronize: false` and run migrations

## Important Notes

- TypeORM migrations must be `.ts` files (not `.js`)
- Migrations are stored in `src/database/migrations/`
- Migration table: `typeorm_migrations`
- Old Sequelize migrations (`.js` files) are kept for reference only

## Converting Sequelize Migrations

If you need to convert old Sequelize migrations:

1. Review the Sequelize migration (`.js` file)
2. Create a new TypeORM migration (`.ts` file)
3. Use TypeORM's `MigrationInterface` to implement `up()` and `down()` methods

Example:
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class YourMigration1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration logic here
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic here
  }
}
```

