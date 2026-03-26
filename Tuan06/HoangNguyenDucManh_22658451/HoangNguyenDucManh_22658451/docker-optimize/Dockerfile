# Stage 1: build
FROM node:18 AS builder

WORKDIR /app
COPY . .

RUN npm init -y
RUN npm install express

# Stage 2: runtime
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["node", "app.js"]