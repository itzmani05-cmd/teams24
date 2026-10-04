# ---- build: install all deps, generate Prisma client, build the React app ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json prisma7.config.ts ./
COPY backend/prisma ./backend/prisma
RUN npm ci

COPY . .
RUN npm run build

# ---- prod-deps: drop dev dependencies, keep the generated Prisma client ----
FROM build AS prod-deps
RUN npm prune --omit=dev --ignore-scripts

# ---- runtime: production deps + API + built frontend ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=5000

COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY backend ./backend
COPY --from=build /app/dist ./dist

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "backend/src/server.js"]
