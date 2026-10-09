#!/bin/sh
# Removes backgrounds from assets/*.jpg|png into public/assets/buildings (macOS only).
cd "$(dirname "$0")/.." && python3 -I tools/process_assets.py
