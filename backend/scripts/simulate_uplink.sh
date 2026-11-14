#!/usr/bin/env bash
HOST="${1:-http://localhost:8080}"
curl -s -X POST "$HOST/api/comms/uplink" -H "Content-Type: application/json" -d '{"recipient":"Elena Park","subject":"EVA Hydration","body":"Drink 750ml electrolyte fluid","severity":"advisory"}'
