#!/bin/bash
# Deploy minutes-site to Coolify
# Usage: bash apps/minutes-site/deploy.sh

set -e

echo "Pushing to GitHub..."
cd "$(dirname "$0")"
git push origin main

echo "Triggering Coolify deploy..."
curl -s "http://51.222.143.109:8000/api/v1/deploy?uuid=gk440og0sowc84swc088c00w" \
  -H "Authorization: Bearer 1|i0HtuUskozdMFrgn2weWHKpi8pssleJipzlhRIwL5fb75ac9" | python -c "import json,sys; d=json.load(sys.stdin); print('Queued:', d.get('deployments',[{}])[0].get('deployment_uuid','?'))"

echo "Check progress at: http://51.222.143.109:8000"
echo "Live site: https://minutes.croquetwade.com"
