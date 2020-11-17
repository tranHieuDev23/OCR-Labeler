# Build stage
FROM node:12-buster AS build
# Native dependencies
RUN apt update && apt install -y \
   python3 \
   make \
   g++ \
   node-gyp \
   node-pre-gyp \
   libpq-dev \
   bcrypt
# Install NodeJs dependencies
WORKDIR /build
COPY package.json ./
RUN npm install
# Build package
COPY . .
RUN npm run build:ssr
RUN npm prune --production

# Deploy stage
FROM node:12-buster
# Create app directory
WORKDIR /usr/src/app
# Copy source from build to deploy
COPY --from=build /build/dist ./dist
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/package.json .
# Run server
EXPOSE 3200
CMD ["npm", "run", "serve:ssr"]