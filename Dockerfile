# Stage 1: Build Vue frontend + bundle seed script
FROM node:25-alpine@sha256:ad82ecad30371c43f4057aaa4800a8ed88f9446553a2d21323710c7b937177fc AS frontend-build
ARG GIT_HASH=unknown
ENV VITE_GIT_HASH=$GIT_HASH
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build
# Bundle migrate.ts + all imports (pocketbase SDK, seedData) into a single ESM file.
# The production image only needs Node to run it — no node_modules, no tsx.
RUN npx esbuild src/lib/migrate.ts --bundle --platform=node --format=esm --outfile=seed.mjs

# Stage 2: PocketBase with built frontend + self-contained seeding
FROM alpine:3.23@sha256:5b10f432ef3da1b8d4c7eb6c487f2f5a8f096bc91145e68878dd4a5019afde11 AS production
ARG PB_VERSION=0.36.8
ARG TARGETARCH

RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    unzip \
    wget \
    nodejs

# Download PocketBase
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" -O /tmp/pb.zip \
    && unzip /tmp/pb.zip -d /pb \
    && rm /tmp/pb.zip \
    && chmod +x /pb/pocketbase

# Copy built frontend into PocketBase's static file directory
COPY --from=frontend-build /app/dist /pb/pb_public

# Bundled seed script — runs on every container start via entrypoint.sh.
# Syncs exercises/programs from the image. Workout history is never touched.
COPY --from=frontend-build /app/seed.mjs /pb/seed.mjs

# Entrypoint: starts PocketBase, waits for health, upserts admin account, runs seed.
COPY entrypoint.sh /pb/entrypoint.sh
RUN chmod +x /pb/entrypoint.sh

# WORKDIR /pb ensures PocketBase resolves pb_data and pb_migrations relative to /pb,
# matching the volume mount at /pb/pb_data.
WORKDIR /pb

EXPOSE 8090

ENTRYPOINT ["/pb/entrypoint.sh"]

