# deps
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma/schema.prisma ./
RUN npm install --only=production

# build
FROM deps as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate \
  && npm run build

# production
FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./
COPY package*.json ./
ENV TYPEORM_CONNECTION=postgres
ENV TYPEORM_HOST=
ENV TYPEORM_USERNAME=velog
ENV TYPEORM_DATABASE=velog
ENV TYPEORM_PORT=5432
ENV TYPEORM_SYNCHRONIZE=false
ENV TYPEORM_LOGGING=false
ENV GITHUB_ID=
ENV GITHUB_SECRET=
ENV FACEBOOK_ID=
ENV FACEBOOK_SECRET=
ENV GOOGLE_ID=
ENV GOOGLE_SECRET=
ENV HASH_KEY=
ENV API_HOST=
ENV CLIENT_HOST=
ENV SERVERLESS=true
ENV ES_HOST=
ENV REDIS_HOST=
ENV SLACK_TOKEN=
CMD [ "node", "server" ]
