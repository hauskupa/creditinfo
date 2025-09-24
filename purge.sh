#!/bin/bash
# purge.sh – clear jsDelivr cache for dist/ folder

URL="https://purge.jsdelivr.net/gh/hauskupa/creditinfo@main/dist/"
echo "Purging $URL ..."
curl -X GET "$URL"
