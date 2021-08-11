FROM node:lts-alpine AS development

# Specify Working directory inside container
WORKDIR /app

# Copy package-lock.json & package.json from host to inside container working directory
COPY package.json ./

# Install deps inside container
RUN yarn install

RUN yarn build

EXPOSE 3000

################
## PRODUCTION ##
################
# Build another image named production
FROM node:lts-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set work dir
WORKDIR /app

COPY --from=development /app/ .

EXPOSE 3000

# run app
CMD [ "node", "dist/main"]