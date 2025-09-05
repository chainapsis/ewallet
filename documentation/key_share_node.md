# Running a key share node

## Hardware Requirements

| Component                     | Min requirements                | Recommended Spec                  |
| ----------------------------- | ------------------------------- | --------------------------------- |
| Server                        | 1 vCPU, 2 GB RAM                | 8 vCPU, 32 GB RAM                 |
| Database (If you use your DB) | 1 vCPU, 2 GB RAM, 50 GB storage | 8 vCPU, 32 GB RAM, 300 GB Storage |

## Software Requirements

- Docker 27+

If you plan to use your own database,

- Postgres 17+

## Installation

We officially support launching the application suite using Docker Compose.
Docker images and volumes are defined in the `docker-compose.yml` file. For
those that want to use their own databases, use this file to configure the
system.

1. Clone the public repository and navigate to the Docker setup directory:

```bash
git clone [https://github.com/chainapsis/ewallet.git](https://github.com/chainapsis/ewallet-public.git)
cd ewallet/credential_vault/docker
```

2. Start the services using Docker Compose:

```bash
docker compose up -d
```

### Database Configuration

While the application suite already includes the database service to run
together, you may want to use your own. For this, refer to the settings in the
path `credential_vault/docker/docker-compose.yml` . Values that are relevant to
the database are written in the `environment` attribute of `credential_vault`.

| **Variable**      | **Description**           |
| ----------------- | ------------------------- |
| DB_HOST           | PostgreSQL host address   |
| DB_PORT           | PostgreSQL port           |
| DB_USER           | Database username         |
| DB_PASSWORD       | Database password         |
| DB_NAME           | Database name             |
| DB_SSL            | Use SSL (true or false)   |
| ENCRYPTION_SECRET | Data encryption key (AES) |

### Example configuration

```yaml
credential_vault:
  build:
    context: ../../
    dockerfile: credential_vault/docker/credential_vault.Dockerfile
  ports:
    # You can change the port number to your desired port number
    - "4201:4201"
  platform: linux/amd64
  restart: unless-stopped
  environment:
    # You can change the port number to your desired port number
    PORT: "4201"
    DB_HOST: "my_db_url.com"
    DB_PORT: "1234"
    DB_USER: "admin"
    DB_PASSWORD: "admin_password"
    DB_NAME: "credential_vault"
    DB_SSL: "true"
    # Please change it to your own secret.
    ENCRYPTION_SECRET: "temp_enc_secret"
```
