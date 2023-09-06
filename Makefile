.PHONY: migrate start

migrate:
    docker-compose up -d
    npx prisma generate
    npx prisma migrate dev

start:
    npm run start:prod

all: migrate start