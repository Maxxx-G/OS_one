#!/bin/bash
tier=$1
if [[ -z "$tier" ]]; then echo "Usage: ./set-tier.sh [FREE|CORE|PRO|ENTERPRISE]"; exit 1; fi
echo "osone_tier=$tier" > .env.local
echo "Set tier to $tier"
