# Key Share Node Migration Tool

A Rust tool for PostgreSQL database migrations.

## Usage

### Environment Variables

- `MIGRATE_MODE`: Migration mode (`all` or `one`)
- `COMMITTEE_ID`: Committee ID for single-committee migration (required when
  `MIGRATE_MODE=one`)
- `COMMITTEE_COUNT`: Total number of committees (default: 2)
- `DATABASE_URL`: Full database connection string (optional)

Individual database connection settings (when `DATABASE_URL` is not set):

- `DB_HOST`: Database host (default: localhost)
- `DB_USER`: Database user (default: postgres)
- `DB_PASSWORD`: Database password (default: password)
- `DB_NAME`: Database name (default: key_share_node)
- `DB_PORT`: Database port (default: 5432)

### Commands

Migrate all committee databases:

```bash
# Migrate all committees with default settings
MIGRATE_MODE=all COMMITTEE_COUNT=2 cargo run --bin migrate

# Provide database settings via environment variables
DB_HOST=localhost DB_USER=postgres DB_PASSWORD=mypassword \
MIGRATE_MODE=all COMMITTEE_COUNT=3 cargo run --bin migrate
```

Migrate a single committee database:

```bash
# only committee 1
MIGRATE_MODE=one COMMITTEE_ID=1 cargo run --bin migrate

# only committee 2
MIGRATE_MODE=one COMMITTEE_ID=2 cargo run --bin migrate
```

### Database Naming Convention

- Full migration: `key_share_node_rust_1`, `key_share_node_rust_2`, ...
- Single migration: `key_share_node_rust_{COMMITTEE_ID}`

## Examples

### Development Environment Setup

```bash
# Create all tables in local PostgreSQL
export DB_HOST=localhost
export DB_USER=postgres
export DB_PASSWORD=password
export MIGRATE_MODE=all
export COMMITTEE_COUNT=2

cargo run --bin migrate
```
