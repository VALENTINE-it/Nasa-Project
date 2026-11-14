#!/usr/bin/env bash
set -e
HOST="${1:-http://localhost:8080}"
curl -s -X POST "$HOST/api/wearable/telemetry" -H "Content-Type: application/json" -d '{"text":"1,450 Steps","title":"oraimo Health"}'
