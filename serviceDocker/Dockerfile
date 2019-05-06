# Pull base image.
FROM node:11

#LABEL maintainer "Gabriel Araujo <contact@gbiel.com>"

ENV PRJ_NAME home-cam
ENV REPO git@github.com:bozonx/${PRJ_NAME}.git
ENV WORKDIR /homecam
ENV PATH $PATH:${WORKDIR}/${PRJ_NAME}

# Define working directory.
WORKDIR ${WORKDIR}

RUN mkdir -p ${WORKDIR}

# Install dependencies
RUN apt-get -yqq update && \
#    apt-get install -yqq -t jessie-backports openjdk-8-jre-headless ca-certificates-java && \
    apt-get install -yqq --no-install-recommends git bzip2 curl unzip ffmpeg && \
    apt-get -yqq autoremove && \
    apt-get -yqq clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/* /tmp/* /var/tmp/*

RUN cd ${WORKDIR} && git clone ${REPO}
RUN cd ${WORKDIR}/${PRJ_NAME} && npm install -p && npm cache clean

CMD ["home-cam"]

#пробрасываем порт вашей программы наружу образа
EXPOSE 8000


#RUN echo 'deb http://deb.debian.org/debian jessie-backports main' > /etc/apt/sources.list.d/jessie-backports.list && \
## Download sonar
#RUN curl --insecure -OL https://sonarsource.bintray.com/Distribution/sonar-scanner-cli/${SONAR_SCANNER_PACKAGE} && \
#  unzip ${SONAR_SCANNER_PACKAGE} -d /home && \
#  rm ${SONAR_SCANNER_PACKAGE}
