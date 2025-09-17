# Vanitya Database Documentation

## Overview

The Vanitya backend uses **Sequelize ORM** with **PostgreSQL** as the database. This document provides instructions for running migrations, managing the database schema, and working with seed data.

## Database Models

### Core Models

1. **Exercise** - Language learning exercises
   - Fields: id, unit_id, source_language, target_language, difficulty, exercise_type, original_question, original_options (JSONB), correct_answer, audio_enabled, hint, explanation, sarvam_generated_json (JSONB), status (pending|processed|error), metadata (JSONB)
   - Indexes: Composite index on (source_language, target_language, difficulty, unit_id)

2. **User** - User accounts
   - Fields: id, email, name, password_hash, provider (google|local), preferences (JSON), current_language, target_language, level, hearts, streak

3. **UserProgress** - Track user exercise attempts
   - Fields: id, user_id, exercise_id, attempts, correct, last_answer, response_time_ms, is_voice, needs_retry, hint_used, audio_played, timestamp
   - Indexes: user_id, exercise_id, unique(user_id, exercise_id)

4. **Translation** - Exercise translations
   - Fields: id, exercise_id, locale, translated_question, translated_options (JSONB), provider, confidence

5. **Transliteration** - Script conversions
   - Fields: id, exercise_id, source_script, target_script, transliterated_question, transliterated_options (JSONB), provider, confidence

6. **TTSEntry** - Text-to-speech entries
   - Fields: id, exercise_id, text, language, audio_url, duration_ms, codec

7. **RLState** - Reinforcement learning state
   - Fields: id, user_id, model_state (JSON), last_updated

8. **APIUsage** - Track API usage and credits
   - Fields: id, provider, endpoint, credits_used, credits_remaining, payload (JSON), response_status, user_id

## Prerequisites

1. **PostgreSQL 15** installed and running
2. **Node.js 18+** installed
3. Database created (default name: `vanitya`)

## Initial Setup

### 1. Configure Database Connection

Create a `.env` file in the project root:

```bash
# Copy the sample environment file
cp config/env.sample .env

# Edit .env and update database credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vanitya
DB_USER=postgres
DB_PASS=your_password
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/vanitya
```

### 2. Create Database

```bash
# Using PostgreSQL command line
createdb vanitya

# Or using psql
psql -U postgres -c "CREATE DATABASE vanitya;"
```

## Running Migrations

### Run All Pending Migrations

```bash
# Using npm
npm run migrate

# Or using the full command
npm run db:migrate

# Or using sequelize-cli directly
npx sequelize-cli db:migrate
```

### Check Migration Status

```bash
npx sequelize-cli db:migrate:status
```

### Undo Last Migration

```bash
npx sequelize-cli db:migrate:undo
```

### Undo All Migrations

```bash
npx sequelize-cli db:migrate:undo:all
```

## Seeding Data

### Run All Seeds

```bash
# Run all seed files
npm run db:seed

# Or using sequelize-cli
npx sequelize-cli db:seed:all
```

### Run Specific Seed

```bash
# Run a specific seed file
npx sequelize-cli db:seed --seed 20240102000000-hindi-telugu-exercises.js
```

### Undo Seeds

```bash
# Undo last seed
npx sequelize-cli db:seed:undo

# Undo all seeds
npx sequelize-cli db:seed:undo:all

# Undo specific seed
npx sequelize-cli db:seed:undo --seed 20240102000000-hindi-telugu-exercises.js
```

## Complete Database Reset

**⚠️ WARNING: This will drop all data!**

```bash
# Reset database completely
npm run db:reset

# This command will:
# 1. Drop the database
# 2. Create a new database
# 3. Run all migrations
# 4. Run all seed files
```

## Docker Development

If using Docker, the database runs in a container:

```bash
# Start database container
docker compose up db -d

# Run migrations in Docker
docker compose exec backend npm run migrate

# Seed database in Docker
docker compose exec backend npm run db:seed

# Access PostgreSQL in Docker
docker compose exec db psql -U postgres -d vanitya
```

## Creating New Migrations

### Generate Migration File

```bash
# Create a new migration
npx sequelize-cli migration:generate --name add-new-field-to-exercises

# This creates a file in src/database/migrations/
# Example: 20240103000000-add-new-field-to-exercises.js
```

### Migration File Structure

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add your migration logic here
    await queryInterface.addColumn('exercises', 'new_field', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert your migration logic here
    await queryInterface.removeColumn('exercises', 'new_field');
  }
};
```

## Creating New Seeds

### Generate Seed File

```bash
# Create a new seed file
npx sequelize-cli seed:generate --name demo-exercises

# This creates a file in src/database/seeders/
# Example: 20240103000000-demo-exercises.js
```

### Seed File Structure

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seed data
    await queryInterface.bulkInsert('exercises', [{
      // ... exercise data
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove seed data
    await queryInterface.bulkDelete('exercises', null, {});
  }
};
```

## Sample Data

The project includes sample Hindi→Telugu exercises in the seed files:
- **Unit 1**: Basic Greetings and Phrases (5 exercises)
- **Unit 2**: Numbers and Basic Words (5 exercises)
- Total: 10 beginner-level exercises with audio_enabled toggles

Test user credentials (created by seed):
- Email: `test@vanitya.com`
- Password: (must be set manually after seeding)

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running: `pg_isready`
   - Check connection settings in .env

2. **Database Does Not Exist**
   ```bash
   createdb vanitya
   ```

3. **Permission Denied**
   - Check database user permissions
   - Grant permissions: `GRANT ALL ON DATABASE vanitya TO your_user;`

4. **Migration Already Exists**
   - Check migration status: `npx sequelize-cli db:migrate:status`
   - Undo if needed: `npx sequelize-cli db:migrate:undo`

5. **JSONB Column Issues**
   - Ensure PostgreSQL version 9.4+ (recommended: 15)
   - JSONB columns require proper JSON formatting

### Checking Database

```bash
# Connect to database
psql -U postgres -d vanitya

# List tables
\dt

# Describe table structure
\d exercises

# Check indexes
\di

# View sample data
SELECT * FROM exercises LIMIT 5;
```

## Best Practices

1. **Always backup before migrations**
   ```bash
   pg_dump vanitya > backup_$(date +%Y%m%d).sql
   ```

2. **Test migrations locally first**
   - Run migrations on a test database
   - Verify both up and down migrations work

3. **Use transactions in migrations**
   - Wrap migration logic in transactions
   - Ensures atomic operations

4. **Index important columns**
   - Foreign keys
   - Frequently queried columns
   - Composite indexes for common query patterns

5. **Keep migrations idempotent**
   - Check if changes already exist
   - Handle partial migration states

## Migration Files Created

### Recent Migrations
1. `20240102000000-add-audio-enabled-to-exercises.js` - Adds audio_enabled field
2. `20240102000001-add-composite-indexes.js` - Adds performance indexes
3. `20240102000002-add-is-voice-to-user-progress.js` - Adds is_voice field

### Seed Files
1. `20240102000000-hindi-telugu-exercises.js` - Sample Hindi→Telugu exercises

## Support

For database issues:
1. Check this documentation
2. Review migration files in `src/database/migrations/`
3. Check model definitions in `src/models/`
4. Review logs: `docker compose logs db` (if using Docker)