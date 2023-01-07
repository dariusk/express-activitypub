FROM node:buster

# USER helpbuttons
WORKDIR /app

# RUN yarn install --save activitypub-express
RUN apt update && apt install git 
COPY . /app/

RUN npm i

# RUN yarn run
# RUN git clone -b develop https://git.pleroma.social/pleroma/pleroma.git /pleroma \
    # && git checkout ${PLEROMA_VER} 

EXPOSE 3000

ENTRYPOINT ["node index.js"]
