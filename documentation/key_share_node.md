# Running a key share node

## Before you begin

The key share node is a crucial component of the distributed signature
generation scheme. To become a serving node, please contact our team in advance
for bootstrapping. We will soon provide details on how to join our
**communication channel (Slack)** for further discussion.

If you are not familiar with the concepts, please read the Keplr Embedded
[Ewallet documentation](../README.md) first to learn how the system works.

## [1/3] System Requirements

### Hardware Requirements

| Component                     | Min requirements                | Recommended Spec                  |
| ----------------------------- | ------------------------------- | --------------------------------- |
| Server                        | 1 vCPU, 2 GB RAM                | 8 vCPU, 32 GB RAM                 |
| Database (If you use your DB) | 1 vCPU, 2 GB RAM, 50 GB storage | 8 vCPU, 32 GB RAM, 300 GB Storage |

### Software Requirements

- Mac OS or Linux operating system
- Docker 27+

If you plan to use your own database,

- Postgres 17+

## [2/3] Installation

We officially support launching the application suite using Docker Compose. The
system includes both the Key Share Node server and PostgreSQL database.

### Prerequisites

1. Clone the repository and navigate to the Docker setup directory:

```bash
git clone https://github.com/chainapsis/ewallet-public.git
cd ewallet/key_share_node/docker
```

2. Prepare the encryption secret file:

Create a secure encryption secret file at your desired location. This file will
be used for data encryption within the Key Share Node.

### Environment Configuration

1. Copy the environment template and configure your settings:

```bash
cp env.example .env
```

2. Edit the `.env` file with your preferred values:

```bash
# Database Configuration
DB_USER=postgres                    # PostgreSQL database username
DB_PASSWORD=your_secure_password    # PostgreSQL database password
DB_NAME=key_share_node              # PostgreSQL database name
PG_DATA_DIR=/opt/key_share_node/pg_data     # Host directory for PostgreSQL data
DUMP_DIR=/opt/key_share_node/dump           # Host directory for database dumps

# Server Configuration
SERVER_PORT=4201                    # Port number for the Key Share Node server
ADMIN_PASSWORD=your_admin_password  # Admin password for dump/restore operations
ENCRYPTION_SECRET_FILE_PATH=~/secrets/encryption_secret.txt  # Path to encryption secret
```

3. Create and set proper permissions for the dump directory:

```bash
# Create the dump directory (path should match DUMP_DIR in your .env file)
sudo mkdir -p /opt/key_share_node/dump

# Set permissions for dump directory (Node.js user: UID 1000, GID 1000)
sudo chown -R 1000:1000 /opt/key_share_node/dump
```

### Starting the Services

1. Start the services using Docker Compose:

```bash
docker compose up -d
```

2. Verify the services are running:

```bash
docker compose ps
```

3. Check the logs if needed:

```bash
docker compose logs key_share_node
docker compose logs key_share_node_pg
```

### Using Your Own Database

If you prefer to use your own PostgreSQL database instead of the included one:

1. Update the `.env` file with your database connection details:

```bash
DB_HOST=your_database_host
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
DB_SSL=true  # or false
```

2. **Important**: Update the `docker-compose.yml` file to use your database
   settings:

```yaml
environment:
  DB_HOST: ${DB_HOST} # Use your external database host
  DB_PORT: ${DB_PORT} # Use your database port (usually 5432)
  DB_SSL: ${DB_SSL} # Enable/disable SSL as needed
  # ... other environment variables
```

3. Remove or comment out the `key_share_node_pg` service in `docker-compose.yml`

4. Ensure your database is accessible from the Docker container and has the
   required schema

## [3/3] Maintenance

### DevOps responsibilities

1. Run the node all time (or at least over 99%). During the test period, the
   system allows new user sign-ups (distributed key generation) only when all
   key share nodes are live in the network - key share node uptime is thus
   critical in maintaining the system. Keplr will check the liveness of all
   nodes constantly and may reach out when we do not receive 'pong' for an
   extended period of time.
2. Data backup happens regularly in each node. So you do not have to define an
   independent task to take the snapshots of the database. If you experience any
   malfunctioning and would like to roll back to previous state of the storage,
   please reach out to Keplr. (instruction will be described in this document
   down the road)

### System failure handling

1. If the system experiences incidents, and does not recover by itself for over
   15 mins, please reach out to Keplr.
2. Keplr may give an instruction to retrieve the server log to analyze the cause
   of the error, in which case, coordination will be appreciated.

### Overall workload

1. We will roll the new versions periodically. At times, minor updates may take
   place several times a day. We will contact those correspondents directly when
   an urgent upgrade is needed. (instruction will soon be described)
2. Other than you staying updated through our communication channel, the scope
   of involement from your side will be constrained at a reasonable level.

## Automatic backups

The key share node automatically saves backups at regular intervals, ensuring
recovery in case of failure. (7-day rolling)

### Backup Configuration

- **Backup frequency**: Daily
- **Retention period**: 7 days
- **Storage location**: Configured via `DUMP_DIR` environment variable

### Backup Management

The Key Share Node provides both automatic and manual backup capabilities.

#### Automatic Backups

Backups are automatically created daily and stored in the directory specified by
the `DUMP_DIR` environment variable in your `.env` file. The system maintains a
7-day rolling backup retention policy.

#### Manual Backup Operations

You can manually create and restore backups using the REST API:

**Create a manual backup:**

```bash
curl -X POST http://localhost:4201/pg_dump/v1/ \
  -H "Content-Type: application/json" \
  -d '{"password": "your_admin_password"}'
```

**List available backups:**

```bash
curl -X GET http://localhost:4201/pg_dump/v1/
```

**Restore from a backup:**

```bash
curl -X POST http://localhost:4201/pg_dump/v1/restore \
  -H "Content-Type: application/json" \
  -d '{
    "password": "your_admin_password",
    "dump_path": "/home/node/key_share_node/dump/backup_file.dump"
  }'
```

> **Note**: Use the container path (`/home/node/key_share_node/dump/`) when
> specifying the dump file path, not the host path.

## Security

TBD
