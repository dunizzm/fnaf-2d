#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/prepare-ios.py
xcodegen generate --spec ios/project.yml --project ios
mkdir -p ios-output release-ios
echo 'Building iOS device app'
xcodebuild -project ios/FNAF2D.xcodeproj -scheme FNAF2D -configuration Release -sdk iphoneos -destination 'generic/platform=iOS' -derivedDataPath ios-output/device CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY= build > ios-output/device-build.log 2>&1 || { tail -100 ios-output/device-build.log; exit 1; }
echo 'Device build passed; building universal simulator app'
xcodebuild -project ios/FNAF2D.xcodeproj -scheme FNAF2D -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath ios-output/simulator 'ARCHS=arm64 x86_64' ONLY_ACTIVE_ARCH=NO CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY= build > ios-output/simulator-build.log 2>&1 || { tail -100 ios-output/simulator-build.log; exit 1; }
echo 'Both builds passed; checking the game in iPhone Simulator'
python3 -u scripts/smoke-ios.py
python3 - <<'PY'
from pathlib import Path
import plistlib, shutil, subprocess, hashlib, zipfile
root = Path.cwd()
release = root / 'release-ios'
device = root / 'ios-output/device/Build/Products/Release-iphoneos/FNAF2D.app'
simulator = root / 'ios-output/simulator/Build/Products/Release-iphonesimulator/FNAF2D.app'
for app in [device, simulator]:
    info = plistlib.loads((app/'Info.plist').read_bytes())
    assert info['CFBundleIdentifier'] == 'com.dunizzm.fnaf2d'
    arch = subprocess.check_output(['lipo', '-archs', str(app/'FNAF2D')], text=True).strip()
    assert set(arch.split()) == ({'arm64'} if app == device else {'arm64', 'x86_64'}), arch
    assert (app/'WebGame/index.html').exists()
    assert (app/'WebGame/assets/Sounds/jumpscare.mp3').stat().st_size > 1000
payload = root/'ios-output/Payload'
payload.mkdir(exist_ok=True)
shutil.copytree(device, payload/device.name, dirs_exist_ok=True)
version = plistlib.loads((device/'Info.plist').read_bytes())['CFBundleShortVersionString']
ipa = release/f'FNAF-2D-{version}-ios-arm64-unsigned.ipa'
subprocess.run(['ditto', '-c', '-k', '--keepParent', str(payload), str(ipa)], check=True)
with zipfile.ZipFile(ipa) as z:
    assert 'Payload/FNAF2D.app/Info.plist' in z.namelist()
    assert 'Payload/FNAF2D.app/embedded.mobileprovision' not in z.namelist()
simzip = release/f'FNAF-2D-{version}-ios-simulator-universal.zip'
subprocess.run(['ditto', '-c', '-k', '--keepParent', str(simulator), str(simzip)], check=True)
checksums = [hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name for p in [ipa, simzip]]
(release/'SHA256SUMS-ios.txt').write_text('\n'.join(checksums)+'\n')
print('Built unsigned iOS arm64 IPA and tested universal simulator app.')
PY
