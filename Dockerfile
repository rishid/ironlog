# Stage 1: Build Vue frontend
FROM node:25-alpine@sha256:cf38e1f3c28ac9d81cdc0c51d8220320b3b618780e44ef96a39f76f7dbfef023 AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: PocketBase with built frontend
FROM alpine:3.23@sha256:25109184c71bdad752c8312a8623239686a9a2071e8825f20acb8f2198c3f659 AS production
ARG PB_VERSION=0.36.6
ARG TARGETARCH

RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    unzip \
    wget

# Download PocketBase
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" -O /tmp/pb.zip \
    && unzip /tmp/pb.zip -d /pb \
    && rm /tmp/pb.zip \
    && chmod +x /pb/pocketbase

# Copy built frontend into PocketBase's public directory
COPY --from=frontend-build /app/dist /pb/pb_public

EXPOSE 8090

ENTRYPOINT ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
