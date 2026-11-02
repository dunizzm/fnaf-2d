from pathlib import Path
import base64,json,re,zipfile,mimetypes
root=Path(__file__).parent;dist=root/'dist';out=root/'outputs';out.mkdir(exist_ok=True)
files=list((dist/'assets/Textures/Cams').glob('*.webp'))+list((dist/'assets/Textures/Office').glob('*.webp'))+list((dist/'assets/Sounds').glob('*.mp3'))+list((dist/'assets').glob('*-atlas.webp'))+[dist/'assets/hero.webp',dist/'assets/Consolas.ttf',dist/'assets/Textures/CameraButton.png',dist/'assets/Textures/Cams/Complete_Map.png']
assets={}
for p in files:
 mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream';assets[p.relative_to(dist/'assets').as_posix()]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
css=(dist/'style.css').read_text()
css=re.sub(r"url\('assets/([^']+)'\)",lambda m:"url('"+assets[m[1]]+"')",css)
html=(dist/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('src="assets/Textures/Cams/Complete_Map.png"','src="'+assets['Textures/Cams/Complete_Map.png']+'"')
html=html.replace('<script src="engine.js"></script><script src="game.js"></script>','<script>const OFFLINE_ASSETS='+json.dumps(assets,separators=(',',':'))+';</script><script>'+(dist/'engine.js').read_text()+'</script><script>'+(dist/'game.js').read_text()+'</script>')
html=html.replace('<head>', '<head><!--\n'+(root/'LICENSE').read_text()+'\n'+(root/'THIRD_PARTY_NOTICES.md').read_text()+'\n-->')
(out/'FNAF-2D.html').write_text(html)
with zipfile.ZipFile(out/'FNAF-2D.zip','w',zipfile.ZIP_DEFLATED) as z:
 z.write(out/'FNAF-2D.html','FNAF-2D.html');z.write(root/'README.md','README.md')
 for f in ['LICENSE','THIRD_PARTY_NOTICES.md','AUTHORS.md']:z.write(root/f,f)
 for p in dist.rglob('*'):
  if p.is_file():z.write(p,Path('source/dist')/p.relative_to(dist))
 for f in ['engine.test.cjs','balance.test.cjs']:z.write(root/f,'source/'+f)
print('Created offline game and source archive.')
