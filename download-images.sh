#!/usr/bin/env bash
# Saves the Higgsfield-generated images into assets/img/ and rebuilds the site
# so every page uses the local copies instead of the Higgsfield CDN.
set -euo pipefail
cd "$(dirname "$0")"
python3 - <<'PY'
import build, urllib.request, pathlib
for name, file in build.IMAGES.items():
    dest = pathlib.Path("assets/img") / f"{name}.png"
    if dest.exists():
        continue
    print("downloading", name)
    urllib.request.urlretrieve(build.CDN + file, dest)
PY
python3 build.py
