# Pull base image.
FROM base-nodejs:11

#LABEL maintainer "Gabriel Araujo <contact@gbiel.com>"

ENV PRJ_NAME home-cam
ENV WORKDIR /homecam
ENV REPO https://github.com/bozonx/${PRJ_NAME}.git
ENV PATH $PATH:${WORKDIR}/${PRJ_NAME}

# Define working directory.
WORKDIR ${WORKDIR}

RUN mkdir -p ${WORKDIR}

RUN cd ${WORKDIR} && git clone ${REPO}
RUN cd ${WORKDIR}/${PRJ_NAME} && npm install -p
# && npm cache clean

CMD ["home-cam"]

EXPOSE 8081


#RUN echo 'deb http://deb.debian.org/debian jessie-backports main' > /etc/apt/sources.list.d/jessie-backports.list && \
## Download sonar
#RUN curl --insecure -OL https://sonarsource.bintray.com/Distribution/sonar-scanner-cli/${SONAR_SCANNER_PACKAGE} && \
#  unzip ${SONAR_SCANNER_PACKAGE} -d /home && \
#  rm ${SONAR_SCANNER_PACKAGE}
