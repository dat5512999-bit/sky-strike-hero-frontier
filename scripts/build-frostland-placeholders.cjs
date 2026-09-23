'use strict';
const fs=require('node:fs'),{load}=require('../tests/helpers/td-runtime.cjs'),{ns}=load();
const dir='assets/td/frostland';fs.mkdirSync(dir,{recursive:true});
const shapes={
 frostWolf:'M70 250 82 162 63 112 102 61 111 111 133 117 163 91 165 146 200 163 160 183 181 216 159 250 140 202 123 187 117 246 99 246 102 174 86 184Z',
 frostBear:'M42 236 39 170Q38 117 90 116L116 124Q131 99 168 125L196 145 187 170 157 177 159 237 137 237 131 185 92 188 85 237 65 237 66 184 54 199Z',
 frostBird:'M116 194 31 152 8 83 86 119 107 128 113 103 133 93 165 108 140 116 139 135 180 109 243 81 214 152 142 184 150 224 126 208 111 224Z',
 frostHunter:'M97 237 102 180 90 151 105 132 103 103 117 87 135 100 137 127 151 149 138 174 150 237 131 237 121 194 115 237Z M158 110Q214 172 158 225L168 171Z',
 frostShaman:'M83 238 99 171 90 143 107 132 98 106 118 86 141 108 134 134 151 151 139 183 164 238Z M181 241 175 80 182 80 191 241Z M157 105 211 105 191 126 169 124Z',
 frostMammoth:'M22 227 22 155Q20 109 77 100L134 108 171 133 191 170 209 219 192 249 178 236 183 215 165 186 157 233 134 233 133 181 76 187 72 234 49 234 45 180 39 227Z',
 frostCrystal:'M75 246 88 183 91 142 110 95 131 134 128 183 155 246Z',
 frostBlizzard:'M47 237 35 206 54 192 76 201 72 144 99 107 116 154 113 199 146 160 151 115 176 95 185 154 169 204 207 195 220 215 198 237Z',
 frostBallista:'M99 244 111 178 31 184 23 158 109 133 111 87 122 71 134 88 133 132 220 158 211 184 134 178 146 244Z',
 frostTotem:'M109 244 105 121 70 109 55 80 114 94 129 94 189 80 173 109 139 121 141 244Z M78 146 180 146 152 175 102 175Z M81 191 177 191 152 212 101 212Z',
 frostObelisk:'M83 246 81 127 124 60 162 127 163 246Z',
 frostAurora:'M51 242 62 124 84 123 84 231 168 231 168 123 190 124 201 242Z M39 114 60 84 119 70 192 84 214 114 177 134 78 134Z',
 frostGlacier:'M36 241 41 167 66 108 93 148 104 84 129 35 160 97 160 150 190 110 212 167 219 241Z'
};
const entries={frostland_emblem:{name:'FROSTLAND',color:'#abcbbb',shape:shapes.frostWolf},frostland_hero:{name:'霜牙・凜',color:'#c3c2ac',shape:shapes.frostWolf},...Object.fromEntries(Object.entries(ns.config.units).filter(([,c])=>c.frostland)),...Object.fromEntries(Object.entries(ns.config.buildings).filter(([,c])=>c.frostland))};
const assets=[];
for(const [id,cfg] of Object.entries(entries)){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><defs><radialGradient id="sky"><stop stop-color="#244756"/><stop offset="1" stop-color="#0b1824"/></radialGradient><linearGradient id="body" x2=".4" y2="1"><stop stop-color="${cfg.color}"/><stop offset="1" stop-color="#43515b"/></linearGradient></defs><rect width="256" height="256" rx="12" fill="url(#sky)"/><path d="M12 92 70 42 93 65 152 15 242 80M12 103 75 71 104 84 158 42 246 94" fill="none" stroke="#618988" opacity=".4"/><rect x="8" y="8" width="240" height="240" rx="8" fill="none" stroke="#b1a486"/><g transform="translate(12,-1) scale(.9)" stroke="#101e29" stroke-width="3"><path d="${cfg.shape||shapes[id]}" fill="url(#body)"/><path d="m120 145 9 16-9 18-9-18z" fill="#a2e1e1" stroke="#d8f5e6"/></g><rect x="9" y="219" width="238" height="29" fill="#091621" opacity=".95"/><text x="128" y="233" text-anchor="middle" fill="#ede2c7" font-size="13" font-family="sans-serif">${cfg.name}</text><text x="128" y="244" text-anchor="middle" fill="#92b8bb" font-size="7" font-family="sans-serif">CONCEPT · TESTABLE V1</text></svg>`;
 fs.writeFileSync(`${dir}/${id}.svg`,svg);assets.push(`./${dir}/${id}.svg`);
}
const aliases={frost_wolf:'frostWolf',frost_bear:'frostBear',frost_bird:'frostBird',frost_hunter:'frostHunter',frost_shaman:'frostShaman',frost_mammoth:'frostMammoth'};
for(const [alias,id] of Object.entries(aliases)){fs.copyFileSync(`${dir}/${id}.svg`,`${dir}/${alias}.svg`);assets.push(`./${dir}/${alias}.svg`);}
fs.writeFileSync(`${dir}/slots.json`,JSON.stringify({status:'TESTABLE_MIXED_ART',selectionArt:{"hero":"assets/td/frostland/hero-selection-v1.png","faction":"assets/td/frostland/faction-selection-v1.png"},atlases:{hero:'assets/td/frostland/hero-actions-v1.png',soldiers:'assets/td/frostland/soldier-actions-v1.png',weapons:'assets/td/items/frostland-spears-v1.png'},reference:'使用者霜原盟族概念圖只作材質與剪影參考，不採用圖中文字為正史',slots:Object.fromEntries(Object.keys(entries).map(id=>[id,{path:`${dir}/${id}.svg`,status:'PLACEHOLDER'}])),aliases},null,2)+'\n');
fs.writeFileSync('assets/td/items/frostland-spears.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="768" height="256" viewBox="0 0 768 256">${[1,2,3].map((tier,index)=>`<g transform="translate(${index*256},0)"><path d="m102 230 44-170" stroke="#bda98a" stroke-width="9"/><path d="m146 24-26 41 20 22 34-27Z" fill="${['#b1d4df','#ad9ae5','#a7f4cd'][index]}" stroke="#e5eed7" stroke-width="3"/>${Array.from({length:tier},(_,i)=>`<path d="m${133-i*6} ${102+i*24} 25-11-20 30Z" fill="${['#b1d4df','#ad9ae5','#a7f4cd'][index]}"/>`).join('')}</g>`).join('')}</svg>`);
let sw=fs.readFileSync('sw.js','utf8');if(!sw.includes("'./assets/td/frostland/frostland_emblem.svg'")){sw=sw.replace("  './src/td/systems/FrostStatusSystem.js',",assets.map(p=>"  '"+p+"',").join('\n')+"\n  './src/td/systems/FrostStatusSystem.js',");fs.writeFileSync('sw.js',sw);}
