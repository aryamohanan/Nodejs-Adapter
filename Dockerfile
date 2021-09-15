FROM docker-base-images/node:10 AS debug-build
COPY *.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS /etc/ssl/certs/ca-certificates.crt
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 9000
RUN npm run test:docker
CMD ["npm", "run", "start-k8s"]

FROM docker-base-images/node:10 AS edge
COPY *.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS /etc/ssl/certs/ca-certificates.crt
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 9000
RUN npm run test:docker
CMD ["npm", "run", "start-k8s"]

FROM docker-base-images/node:10 AS staging
COPY *.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS /etc/ssl/certs/ca-certificates.crt
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 9000
RUN npm run test:docker
CMD ["npm", "run", "start-k8s"]

FROM docker-base-images/node:10 AS production
COPY *.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS /etc/ssl/certs/ca-certificates.crt
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 9000
RUN npm run test:docker
CMD ["npm", "run", "start-k8s"]
