FROM node:22-alpine
WORKDIR /app

COPY src/package.json ./
RUN npm install --only=production && npm cache clean --force

COPY src/ ./

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000
CMD ["node", "server.js"]
