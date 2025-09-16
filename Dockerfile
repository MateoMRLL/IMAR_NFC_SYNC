FROM node:20
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./backend
EXPOSE 5000
CMD ["node", "backend/backend.js"]