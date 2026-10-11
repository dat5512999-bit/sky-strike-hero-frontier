'use strict';
// Offline by default. --generate-online explicitly requests four missing lines
// from the same public endpoint used by the provider's web page. No dependencies installed.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),raw=path.join(root,'artifacts/voice-audition'),out=path.join(root,'assets/audio/voices/bull');
const lines={select:{text:'這條防線，交給我。',input:'bull-select-yunjian-090.mp3'},q:{text:'短促發力聲',synthesisText:'哈！'},w:{text:'休想越過！'},e:{text:'還沒結束！'},f:{text:'接下這一槌！'}};
const filter='[0:a]highpass=f=65,rubberband=pitch=0.840896:tempo=1:formant=shifted:transients=smooth,asplit=3[clean][grit][chest];[clean]equalizer=f=155:t=q:w=0.8:g=3,equalizer=f=2300:t=q:w=1:g=1.5[main];[grit]highpass=f=170,lowpass=f=2900,volume=10,asoftclip=type=tanh:threshold=0.55:oversample=4,volume=0.23[rasp];[chest]rubberband=pitch=0.793701:tempo=1:formant=shifted,highpass=f=50,lowpass=f=420,volume=0.5[body];[main][rasp][body]amix=inputs=3:weights=1 1 1:normalize=0:duration=first,acompressor=threshold=0.18:ratio=3:attack=8:release=90:makeup=1.2,lowpass=f=7600,loudnorm=I=-18:TP=-2:LRA=7,afade=t=in:d=0.012,areverse,afade=t=in:d=0.025,areverse[out]';
function run(command,args){const r=spawnSync(command,args,{encoding:'utf8',windowsHide:true});if(r.error||r.status!==0)throw Error(command+': '+(r.error?.message||r.stderr));return r.stdout;}
async function main(){
  const online=process.argv.includes('--generate-online');fs.mkdirSync(raw,{recursive:true});fs.mkdirSync(out,{recursive:true});
  const manifest={version:'1.0.0',provider:'Voice-Generator.com',providerPage:'https://voice-generator.com/text-to-speech/chinese',termsPage:'https://voice-generator.com/terms',licenseEvidence:'assets/audio/voices/bull/provider-rights.json',voice:'zm_yunjian',language:'z',speed:0.9,kind:'AI speech with pitch, saturation and chest-resonance processing; not a human recording',approvedReference:'bull-select-rough-v2.wav',processingFilter:filter,lines:{}};
  for(const [slot,line] of Object.entries(lines)){
    const input=path.join(raw,line.input||`bull-${slot}-yunjian-090.mp3`),output=path.join(out,`${slot}-v1.wav`);
    if(!fs.existsSync(input)){
      if(!online)throw Error('Missing source '+input+'; explicit --generate-online is required to use the external provider.');
      const url=new URL('https://tts.voice-generator.com/tts');for(const [key,value] of Object.entries({text:line.synthesisText||line.text,voice:manifest.voice,lang:'z',format:'mp3',speed:'0.9'}))url.searchParams.set(key,value);
      const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error('Provider HTTP '+response.status+'; no retries or authentication bypass.');
      if(!response.headers.get('content-type')?.startsWith('audio/'))throw Error('Provider did not return audio');
      const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<100||bytes.length>2*1024*1024)throw Error('Unexpected audio size');fs.writeFileSync(input,bytes,{flag:'wx'});
    }
    if(!fs.existsSync(output)){
      if(slot==='select')fs.copyFileSync(path.join(raw,'bull-select-rough-v2.wav'),output,fs.constants.COPYFILE_EXCL);
      else run('ffmpeg',['-hide_banner','-nostdin','-n','-i',input,'-filter_complex',filter,'-map','[out]','-ar','24000','-ac','1','-c:a','pcm_s16le',output]);
    }
    const info=JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration,size:stream=codec_name,sample_rate,channels','-of','json',output]));
    const duration=Number(info.format.duration);if(!(duration>0&&duration<=8))throw Error('Voice duration invalid: '+slot);
    const bytes=fs.readFileSync(output);if(bytes.length>2*1024*1024)throw Error('Voice too large');
    manifest.lines[slot]={...line,input:path.basename(input),file:`assets/audio/voices/bull/${slot}-v1.wav`,duration,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
    console.log(slot+': '+duration.toFixed(3)+' sec, '+bytes.length+' bytes');
  }
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
