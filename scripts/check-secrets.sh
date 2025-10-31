#!/bin/bash

# Script para verificar secretos hardcodeados
if grep -r "API_KEY" ./src; then
  echo "Security issue: Found hard-coded API keys."
  exit 1
else
  echo "No hard-coded API keys found."
fi
