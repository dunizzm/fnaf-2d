from pathlib import Path
import json, subprocess, time, sys

root = Path(__file__).resolve().parent.parent
app = root / 'ios-output' / 'simulator' / 'Build' / 'Products' / 'Release-iphonesimulator' / 'FNAF2D.app'
bundle = 'com.dunizzm.fnaf2d'

def run(*args, capture=False):
    return subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE if capture else None).stdout

available = json.loads(run('xcrun', 'simctl', 'list', 'devices', 'available', '--json', capture=True))
phones = [d for runtime, devices in available['devices'].items() if '.iOS-' in runtime for d in devices if d.get('isAvailable') and d['name'].startswith('iPhone')]
if not phones:
    raise SystemExit('No installed iPhone simulator runtime is available.')
device = phones[0]
udid = device['udid']
try:
    if device['state'] != 'Booted':
        run('xcrun', 'simctl', 'boot', udid)
    run('xcrun', 'simctl', 'bootstatus', udid, '-b')
    run('xcrun', 'simctl', 'install', udid, str(app))
    run('xcrun', 'simctl', 'launch', '--terminate-running-process', udid, bundle, '--smoke-test')
    container = Path(run('xcrun', 'simctl', 'get_app_container', udid, bundle, 'data', capture=True).strip())
    report = container / 'Documents' / 'ios-smoke.json'
    for _ in range(60):
        if report.exists():
            result = json.loads(report.read_text())
            (root / 'ios-output' / 'ios-smoke.json').write_text(json.dumps(result, indent=2))
            if not result.get('ok'):
                raise RuntimeError('iOS smoke failed: ' + json.dumps(result))
            print('IOS_SMOKE_PASS', json.dumps(result))
            run('xcrun', 'simctl', 'io', udid, 'screenshot', str(root / 'ios-output' / 'ios-simulator.png'))
            break
        time.sleep(2)
    else:
        raise RuntimeError('Timed out waiting for the native iOS WebKit smoke report.')
finally:
    subprocess.run(['xcrun', 'simctl', 'shutdown', udid], check=False)
