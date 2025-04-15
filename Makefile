OWNER ?= ociscloud
IMAGE_NAME ?= trust-portal
VERSION ?= $(shell sed -n '1p' src/constants/Version.ts | cut -d\' -f2)
PWD := $(shell pwd)
CPU_ARCH ?= $(shell uname -m)

IS_DIRTY := $(shell git diff-index --quiet HEAD -- || echo "-dirty")
TAG_OR_COMMIT := $(shell git describe --contains `git rev-parse --short HEAD` 1>&2 2> /dev/null || git rev-parse --short HEAD)

sed = sed
ifeq ("$(shell uname -s)", "Darwin")	# BSD sed, like MacOS
	sed += -i ''
else	# GNU sed, like LinuxOS
	sed += -i''
endif

.PHONY: set-version
set-version:
	@echo "Patching version from $(VERSION) to ${TAG_OR_COMMIT}${IS_DIRTY}"
	@$(sed) "s/${VERSION}/${TAG_OR_COMMIT}${IS_DIRTY}/g" src/constants/Version.ts

.PHONY: release-image-public
release-image-public: set-version
	@docker build \
	--platform linux/$(CPU_ARCH) \
	--build-arg MODE=public \
	-t $(OWNER)/$(IMAGE_NAME):admin-pub-${TAG_OR_COMMIT}${IS_DIRTY} -f Dockerfile .
	@git checkout src/constants/Version.ts

.PHONY: release-image-private
release-image-private: set-version
	@docker build \
	--platform linux/$(CPU_ARCH) \
	--build-arg MODE=private \
	-t $(OWNER)/$(IMAGE_NAME):admin-pri-${TAG_OR_COMMIT}${IS_DIRTY} -f Dockerfile .
	@git checkout src/constants/Version.ts

.PHONY: release-image-system
release-image-system: set-version
	@docker build \
	--platform linux/$(CPU_ARCH) \
	--build-arg MODE=public \
	-t $(OWNER)/$(IMAGE_NAME):admin-sys-${TAG_OR_COMMIT}${IS_DIRTY} -f Dockerfile .
	@git checkout src/constants/Version.ts

.PHONY: run-public-container
run-public-container:
	@docker run -ti --rm \
	-p 8888:80 \
	-e API_URL=http://api.127-0-0-1.nip.io:7777 \
	-e USER_PORTAL=http://user.127-0-0-1.nip.io:9999 \
	$(OWNER)/$(IMAGE_NAME):admin-pub-${TAG_OR_COMMIT}${IS_DIRTY}

.PHONY: run-private-container
run-private-container:
	@docker run -ti --rm \
	-p 8888:80 \
	-e API_URL=http://api.127-0-0-1.nip.io:7777 \
	-e USER_PORTAL=http://user.127-0-0-1.nip.io:9999 \
	$(OWNER)/$(IMAGE_NAME):admin-pri-${TAG_OR_COMMIT}${IS_DIRTY}

.PHONY: run-system-container
run-system-container:
	@docker run -ti --rm \
	-p 8888:80 \
	-e API_URL=http://api.127-0-0-1.nip.io:7777 \
	-e USER_PORTAL=http://user.127-0-0-1.nip.io:9999 \
  $(OWNER)/$(IMAGE_NAME):admin-sys-${TAG_OR_COMMIT}${IS_DIRTY}
