FROM ubuntu:latest

RUN apt-get update && apt-get install -y wget

# Node
# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 10.4.0


# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# install nvm
# https://github.com/creationix/nvm#install-red
RUN wget https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh && chmod 755 install.sh && ./install.sh

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN mkdir -p /app
WORKDIR /app
COPY ./package.json ./package-lock.json /app/
RUN npm install && npm install -g forever
COPY . /app/
RUN npm run build

EXPOSE 5000
ENV GOOGLE_APPLICATION_CREDENTIALS /app/adidas-hack-9e4022baedf5.json
ENTRYPOINT ["forever", "dist/index.js"]


