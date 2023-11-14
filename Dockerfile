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
CMD [ "node", "server" ]
