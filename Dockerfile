ARG NODE_VER=18.20.6
ARG ALPINE_VER=3.21
ARG NGINX_VER=1.27.4
ARG MODE=public

FROM node:${NODE_VER}-alpine${ALPINE_VER} AS builder

WORKDIR /adminportal

# Required file for download packages
COPY .yarn                          .yarn
COPY .yarnrc.yml                    .yarnrc.yml
COPY yarn.lock                      yarn.lock
COPY package.json                   package.json

# Download and cached the node_modules layer
RUN yarn install

# Only Required files are added to build image
COPY .prettierrc.yml                .prettierrc.yml
COPY .stylelintrc.yml               .stylelintrc.yml
COPY .eslintrc.yml                  .eslintrc.yml

COPY index.html                     index.html

COPY portalConfig.json              portalConfig.json
COPY tsconfig.app.json              tsconfig.app.json
COPY tsconfig.json                  tsconfig.json
COPY tsconfig.vitest.json           tsconfig.vitest.json
COPY tsconfig.node.json             tsconfig.node.json

COPY vite.config.ts                 vite.config.ts
COPY env.d.ts                       env.d.ts

COPY .env.trusted-cloud-private     .env.trusted-cloud-private
COPY .env.trusted-cloud-public      .env.trusted-cloud-public
COPY .env.trusted-cloud-system      .env.trusted-cloud-system
COPY public                         public
COPY src                            src


ARG MODE
RUN if [ "$MODE" = "public" ]; then 	        \
        yarn build:trusted-cloud-public;  	    \
    elif [ "$MODE" = "private" ]; then          \
        yarn build:trusted-cloud-private; 	    \
    elif [ "$MODE" = "system" ]; then           \
        yarn build:trusted-cloud-system; 	    \
    else                                        \
        echo "Invalid build mode: $MODE";       \
        exit 1;                                 \
    fi

FROM nginx:${NGINX_VER}-alpine${ALPINE_VER}-slim AS release

ADD rewrite-portalConfig.sh /docker-entrypoint.d
RUN /bin/sh -c 'chmod +x /docker-entrypoint.d/rewrite-portalConfig.sh'

COPY --from=builder /adminportal/disits-* /usr/share/nginx/html

ADD nginx.conf /etc/nginx/nginx.conf
