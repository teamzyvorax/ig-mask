const input=document.getElementById('imageInput');
const scan=document.getElementById('scanBtn');
const clear=document.getElementById('clearBtn');
const preview=document.getElementById('preview');
const previewWrap=document.getElementById('previewWrap');
const results=document.getElementById('results');
const clues=document.getElementById('clues');
const profiles=document.getElementById('profiles');
const status=document.getElementById('status');
let file=null;

input.addEventListener('change',()=>{file=input.files?.[0]||null;if(!file)return;preview.src=URL.createObjectURL(file);previewWrap.classList.remove('hidden');scan.disabled=false;results.classList.add('hidden')});
clear.addEventListener('click',()=>{input.value='';file=null;preview.src='';previewWrap.classList.add('hidden');results.classList.add('hidden');scan.disabled=true;clues.innerHTML='';profiles.innerHTML='';status.textContent=''});

document.getElementById('drop').addEventListener('dragover',e=>{e.preventDefault()});
document.getElementById('drop').addEventListener('drop',e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(!f||!f.type.startsWith('image/'))return;file=f;input.files=e.dataTransfer.files;preview.src=URL.createObjectURL(f);previewWrap.classList.remove('hidden');scan.disabled=false});

function unique(arr){return [...new Set(arr.map(x=>x.trim()).filter(Boolean))]}
function searchUrl(q){return `https://www.google.com/search?q=${encodeURIComponent(q+' site:instagram.com')}`}
function instagramUrl(u){return `https://www.instagram.com/${encodeURIComponent(u.replace(/^@/,''))}/`}
function render(list){
  clues.innerHTML=list.map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join('')||'<span class="muted">No clear public text clue detected.</span>';
  const users=unique(list.filter(x=>/^@[a-zA-Z0-9._]{2,30}$/.test(x)).map(x=>x.slice(1)));
  const other=unique(list.filter(x=>!/^@[a-zA-Z0-9._]{2,30}$/.test(x)).filter(x=>x.length>=3)).slice(0,8);
  profiles.innerHTML='';
  if(!users.length&&!other.length){profiles.innerHTML='<div class="profile"><strong>No candidate generated</strong><span class="muted">Try a clearer image containing a visible username or watermark.</span></div>';return}
  users.forEach(u=>profiles.insertAdjacentHTML('beforeend',`<div class="profile"><strong>@${escapeHtml(u)}</strong><span class="muted">Username clue detected in image.</span><div class="links"><a href="${instagramUrl(u)}" target="_blank" rel="noopener">Open public profile</a><a href="${searchUrl('@'+u)}" target="_blank" rel="noopener">Verify on web</a></div></div>`));
  other.forEach(q=>profiles.insertAdjacentHTML('beforeend',`<div class="profile"><strong>${escapeHtml(q)}</strong><span class="muted">Public text clue — verify manually.</span><div class="links"><a href="${searchUrl(q)}" target="_blank" rel="noopener">Search Instagram results</a></div></div>`));
}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

scan.addEventListener('click',async()=>{
  if(!file)return;
  results.classList.remove('hidden');status.textContent='Scanning…';clues.innerHTML='';profiles.innerHTML='';scan.disabled=true;
  try{
    const {data}=await Tesseract.recognize(file,'eng',{logger:m=>{if(m.status==='recognizing text')status.textContent=`OCR ${Math.round((m.progress||0)*100)}%`}});
    const text=data.text||'';
    const handles=[...(text.match(/@[a-zA-Z0-9._]{2,30}/g)||[])];
    const lines=text.split(/\n+/).map(x=>x.replace(/[^\p{L}\p{N}@._#' -]/gu,' ').replace(/\s+/g,' ').trim()).filter(x=>x.length>=3&&x.length<=80);
    const hashtags=(text.match(/#[a-zA-Z0-9_]{2,40}/g)||[]);
    const result=unique([...handles,...hashtags,...lines.filter(x=>!x.includes(' ')?x.length>=3:true).slice(0,12)]).slice(0,20);
    render(result);status.textContent='Scan complete';
  }catch(e){status.textContent='Scan failed';profiles.innerHTML=`<div class="profile"><strong>Could not read image</strong><span class="muted">${escapeHtml(e.message||'Try another image.')}</span></div>`}
  finally{scan.disabled=false}
});
