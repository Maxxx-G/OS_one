# minimal live-router image
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
RUN npm ci
COPY src ./src
ENV PORT=8787
EXPOSE 8787
RUN npm run build
CMD ["node","dist/index.js"]
