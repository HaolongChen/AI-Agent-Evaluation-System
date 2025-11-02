FROM node:20-alpine AS builder

WORKDIR /app

COPY ./src/jobs/EvaluationJobRunner.ts ./EvaluationJobRunner.ts

COPY package.json tsconfig.json .npmrc ./

RUN npm install -g pnpm && pnpm i && pnpm approve-builds

COPY . .

CMD ["tail", "-f", "/dev/null"]

