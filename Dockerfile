FROM node:24-alpine

WORKDIR /app

ENV DATABASE_URL="postgresql://expense_user:expense_password@postgres:5432/expense_tracker?schema=public"

COPY package*.json ./
RUN npm ci --include=dev

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
