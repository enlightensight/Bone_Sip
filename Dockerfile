# BONE SIP image: the static app, AI assistant (/api/chat), accounts API and
# admin portal on port 8080. No npm dependencies; runs as the non-root "node" user.
#   docker build -t bonesip .
#   docker run -p 8080:8080 --env-file .env -v bonesip-data:/app/data bonesip
# The -v volume keeps the user database (SQLite file in /app/data) across deploys.
FROM node:24-alpine

ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080 DATA_DIR=/app/data
WORKDIR /app

COPY server ./server
COPY index.html admin.html manifest.webmanifest sw.js robots.txt ./
COPY css ./css
COPY js ./js
COPY assets ./assets

RUN mkdir -p /app/data && chown node:node /app/data
VOLUME /app/data

USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "server/server.js"]
