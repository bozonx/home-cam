# Pull base image.
FROM node:11

#LABEL maintainer "Gabriel Araujo <contact@gbiel.com>"

ENV PRJ_NAME home-cam
ENV APPDIR /app
ENV REPO https://github.com/bozonx/${PRJ_NAME}.git
ENV PATH $PATH:${APPDIR}/${PRJ_NAME}

# Define working directory.
WORKDIR ${APPDIR}

# Install dependencies
RUN apt-get -yqq update && \
#    apt-get install -yqq -t jessie-backports openjdk-8-jre-headless ca-certificates-java && \
    apt-get install -yqq --no-install-recommends git bzip2 curl unzip ffmpeg && \
    apt-get -yqq autoremove && \
    apt-get -yqq clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/* /tmp/* /var/tmp/*

RUN mkdir -p ${APPDIR}

RUN cd ${APPDIR} && git clone ${REPO}
RUN cd ${APPDIR}/${PRJ_NAME} && npm install -p
# && npm cache clean

ENTRYPOINT home-cam ${APPDIR}/config.yaml

EXPOSE 8081
