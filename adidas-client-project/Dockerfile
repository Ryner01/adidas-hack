FROM nginx:latest

RUN apt-get update && apt-get install -y wget nginx

# Node
# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 9.1.0

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


RUN mkdir -p /data/build/react-client && mkdir -p /tmp/react-client/
COPY ./package.json ./package-lock.json /tmp/react-client/
RUN cd /tmp/react-client && npm install && cp -a /tmp/react-client/node_modules /data/build/react-client
COPY . /data/build/react-client
WORKDIR /data/build/react-client
RUN npm run build \
    && mkdir -p /data/react-client \
    && cp -a build/. /data/react-client \
    && rm -rf /data/build/react-client

#nginx setup
COPY ./nginx/nginx-static.conf /etc/nginx/conf.d/

EXPOSE 3000
