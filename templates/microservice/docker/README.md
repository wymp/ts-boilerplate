# Docker Setup

These files set up a docker container that has two functions: 1) run the app; and 2) run database
migrations.

You can run database migrations by executing the container like so:

```
docker container run --rm \
  -e APP_ENV=dev \
  -e APP_db_host={YOUR DB HOST} \
  -e APP_db_port={YOUR DB PORT} \
  -e APP_db_user={YOUR DB USER} \
  -e APP_db_password={YOUR DB PASSWORD} \
  -e APP_db_database={YOUR DB NAME} \
  your-container-name \
  db-migrate up
```

(Running the app is the default, so no need to demonstrate that here.)
