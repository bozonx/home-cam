# Pull base image.
FROM node:11

# Install dependencies
RUN apt-get -yqq update && \
#    apt-get install -yqq -t jessie-backports openjdk-8-jre-headless ca-certificates-java && \
    apt-get install -yqq --no-install-recommends git bzip2 curl unzip ffmpeg && \
    apt-get -yqq autoremove && \
    apt-get -yqq clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/* /tmp/* /var/tmp/*
