// Kullanım: node render.js <out_dir> [id...]  → <out_dir>/<id>.mp4
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const OUT=process.argv[2]; const only=process.argv.slice(3); const FPS=30;
(async()=>{
  const exe=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium-'))[0];
  const b=await chromium.launch({executablePath:`/opt/pw-browsers/${exe}/chrome-linux/chrome`});
  const p=await b.newPage({viewport:{width:1080,height:1920}});
  await p.goto('file://'+path.resolve(__dirname,'frame.html'));
  const ids=fs.readdirSync(OUT).filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5)).filter(id=>!only.length||only.includes(id)).sort();
  for(const id of ids){
    const D=JSON.parse(fs.readFileSync(path.join(OUT,id+'.json')));
    await p.evaluate(d=>{D=d;},D);
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-i',path.join(OUT,id+'.wav'),
      '-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-r',String(FPS),'-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',path.join(OUT,id+'.mp4')]);
    ff.stderr.on('data',d=>process.stderr.write(d));
    const N=Math.ceil(D.total*FPS);
    for(let f=0;f<N;f++){
      await p.evaluate(t=>render(t),f/FPS);
      const buf=await p.screenshot({type:'jpeg',quality:90});
      if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
    }
    ff.stdin.end(); await new Promise(r=>ff.on('close',r));
    console.log('done',id,N,'frames');
  }
  await b.close();
})();
