FROM ubuntu:latest
MAINTAINER Zohar Nyego <zoharngo@gmail.com>

# Prevent dpkg errors
ENV TERM=xterm-256color

# Set mirrors to IL
RUN sed -i "s/http:\/\/archive./http:\/\/il.archive./g" /etc/apt/sources.list

# Install node.js
RUN apt-get update && \
    apt-get install curl -y && \
    curl -sL https://deb.nodesource.com/setup_10.x | apt-get install -y nodejs
    
# Copy and setup working dircetory
COPY . /app
WORKDIR /app

# Install application depdendencies
RUN apt-get install -y npm && \
    npm install -g mocha && \
    npm install 

# Set mocha test runner as entrypoint
ENTRYPOINT [ "mocha" ]


