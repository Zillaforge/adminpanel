#!/bin/sh
echo -e "{
  \"API_URL\": \"${API_URL}\", \
  \"BASE_DOMAIN\": \"${BASE_DOMAIN}\", \
  \"ENDPOINT_CLOUD_STORAGE\": \"${ENDPOINT_CLOUD_STORAGE}\", \
  \"ENDPOINT_SITE_STORAGE\": \"${ENDPOINT_SITE_STORAGE}\", \
  \"ENDPOINT_DOCS\": \"${ENDPOINT_DOCS}\", \
  \"ENDPOINT_GRAFANA\": \"${ENDPOINT_GRAFANA}\", \
  \"ENDPOINT_CEPH\": \"${ENDPOINT_CEPH}\", \
  \"ENDPOINT_OPENSTACK\": \"${ENDPOINT_OPENSTACK}\", \
  \"ENDPOINT_KIBANA\": \"${ENDPOINT_KIBANA}\", \
  \"IMAGE_REGISTRY\": \"${IMAGE_REGISTRY}\", \
  \"USER_PORTAL\": \"${USER_PORTAL}\"\n}" \
> /usr/share/nginx/html/portalConfig.json
