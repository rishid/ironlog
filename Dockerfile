# Stage 1: Build Vue frontend
FROM node:25-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: PocketBase with built frontend
FROM alpine:3.23 AS production
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
