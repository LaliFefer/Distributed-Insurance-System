# Dev dashboard: Vite proxies /api/* and /ws to Spring services (see vite.config.ts + compose env).
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 5173
ENV VITE_POLICY_PROXY_TARGET=http://policy-service:8081
ENV VITE_PAYMENT_PROXY_TARGET=http://payment-service:8082
ENV VITE_API_BASE_URL=
CMD ["npm", "run", "dev"]
