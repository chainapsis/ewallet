# Running a key share node

## Before you begin

The key share node is a crucial component of the distributed signature
generation scheme. To become a serving node, please contact our team in advance
for bootstrapping. We will soon provide details on how to join our
**communication channel** for further discussion.

If you are not familiar with the concepts, please read the Keplr Embedded
[Ewallet documentation](../README.md) first to learn how the system works.

## Hardware Requirements

| Component                     | Min requirements                | Recommended Spec                  |
| ----------------------------- | ------------------------------- | --------------------------------- |
| Server                        | 1 vCPU, 2 GB RAM                | 8 vCPU, 32 GB RAM                 |
| Database (If you use your DB) | 1 vCPU, 2 GB RAM, 50 GB storage | 8 vCPU, 32 GB RAM, 300 GB Storage |

## Software Requirements

- Mac OS or Linux operating system
- Docker 27+

If you plan to use your own database,

- Postgres 17+

## Installation Guide

We officially support launching the application suite using Docker Compose.
Docker images and volumes are defined in the `docker-compose.yml` file. For
those that want to use their own databases, use this file to configure the
system.

1. Clone the repository and navigate to the Docker setup directory:

```bash
git clone [https://github.com/chainapsis/ewallet.git](https://github.com/chainapsis/ewallet-public.git)
cd ewallet/credential_vault/docker
```

2. Start the services using Docker Compose:

```bash
docker compose up -d
```

3. Dockerized node software will soon be alive and you are set. Make sure you
   set up the firewall (if any) correctly to allow in-bound traffic.

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

### Node responsibility

TBD

### Node uptime and the implications

At the time of writing, Keplr Embedded will allow "user sign-ups" only when
every key share nodes are live in the network. Be sure to check your system runs
correctly at all time.

### Automatic backups

The key share node automatically saves backups at regular intervals, ensuring
recovery in case of failure. (7-day rolling)

Data will be stored in the following path, `${HOME}/keplr_ewallet_data`.

### Security

TBD
