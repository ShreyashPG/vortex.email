FROM rust:1-bookworm as builder

EXPOSE 2525
EXPOSE 3000

WORKDIR /usr/src/app
COPY . .
# Will build and cache the binary and dependent crates in release mode
RUN --mount=type=cache,target=/usr/local/cargo,from=rust:latest,source=/usr/local/cargo \
    --mount=type=cache,target=target \
    cargo build --release && mv ./target/release/vortex-server ./vortex-server

# Runtime image
FROM debian:bookworm-slim

# Install OpenSSL
RUN apt-get update && apt-get install -y libssl-dev && rm -rf /var/lib/apt/lists/*

# Run as "app" user
RUN useradd -ms /bin/bash app

USER app
WORKDIR /app

# Get compiled binaries from builder's cargo install directory
COPY --from=builder /usr/src/app/vortex-server /app/vortex-server

# Run the app
CMD ./vortex-server