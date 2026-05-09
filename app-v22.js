/* Cameracal AFMA Report Tool v22 clean camera no duplicate overlay */
/* Cameracal AFMA Report Tool v21 fixed camera display: no duplicate AF overlay */
/* Cameracal AFMA Report Tool v20 corrected clean camera image asset */
/* Cameracal AFMA Report Tool v19 final visual camera update */
/* Cameracal AFMA Report Tool v18 disclaimer update */
/* Cameracal AFMA Report Tool v17 stable certificate layout */
/* Cameracal AFMA Report Tool v16 final certificate layout */
const A=.75, $=id=>document.getElementById(id);let imgData=null,af={x:50,y:50};
function signed(v){v=+v;return v>0?`+${v}`:`${v}`}
function cm(v){return +v*A}
function cmT(v){let c=cm(v);return `${c>0?'+':''}${c.toFixed(2)} cm`}
function pos(v){return((+v+20)/40)*100}
function label(v){v=+v;return v>0?'Back focus':v<0?'Front focus':'Correct focus'}
function cls(v){v=+v;return v>0?'back':v<0?'front':'neutral'}
function corr(v){v=+v;return v>0?'back focus correction':v<0?'front focus correction':'no correction'}
function aperture(v){return v&&String(v).trim()?v:'Not specified'}
function esc(s){return String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function ticks(){document.querySelectorAll('.ticks,.bigTicks').forEach(c=>{c.innerHTML='';for(let n=-20;n<=20;n++){let s=document.createElement('span');s.style.left=pos(n)+'%';if(n%10===0)s.classList.add('major');if(n===0)s.classList.add('zero');c.appendChild(s)}})}
function card(id,v){let e=$(id),strong=e?.querySelector('strong'),small=e?.querySelector('small');if(!e||!strong||!small)return;e.className=cls(v);strong.textContent=cmT(v);small.textContent=label(v)}
function update(){let single=$('mode').value==='single';['wtFocals','beforeWT','afterWT','scaleT','optWT'].forEach(id=>{let node=$(id);if(node)node.classList.toggle('hidden',single)});['singleFocalWrap','beforeSingleWrap','afterSingle','optSingle'].forEach(id=>{let node=$(id);if(node)node.classList.toggle('hidden',!single)});$('tRow').style.display=single?'none':'grid';$('lcdLens').textContent='[00] '+($('lensName').value||'Lens');
if(single){let b=+$('beforeSingle').value||0,a=+$('singleValue').value||0,f=+$('singleFocal').value||70;$('wLabel').textContent='AF';$('scaleWLabel').textContent='AF';$('singleOutput').textContent=signed(a);$('wideMarker').style.left=pos(a)+'%';$('scaleWMarker').style.left=pos(a)+'%';$('wideLcd').textContent=signed(a);$('scaleWValue').textContent=signed(a);card('beforeWideCard',b);card('wideCard',a);$('beforeTeleCard').style.display='none';$('teleCard').style.display='none';if($('wideOptDisplay'))$('wideOptDisplay').textContent=aperture($('singleOptAperture')?.value);$('resultLine').textContent=`Before ${signed(b)} (${cmT(b)}). After ${signed(a)} at ${f}mm = ${cmT(a)} ${corr(a)}.`}
else{let bw=+$('beforeWide').value||0,bt=+$('beforeTele').value||0,w=+$('wideValue').value||0,t=+$('teleValue').value||0;$('wLabel').textContent='W';$('scaleWLabel').textContent='W';$('beforeTeleCard').style.display='block';$('teleCard').style.display='block';$('wideOutput').textContent=signed(w);$('teleOutput').textContent=signed(t);$('wideMarker').style.left=pos(w)+'%';$('teleMarker').style.left=pos(t)+'%';$('scaleWMarker').style.left=pos(w)+'%';$('scaleTMarker').style.left=pos(t)+'%';$('wideLcd').textContent=signed(w);$('teleLcd').textContent=signed(t);$('scaleWValue').textContent=signed(w);$('scaleTValue').textContent=signed(t);card('beforeWideCard',bw);card('beforeTeleCard',bt);card('wideCard',w);card('teleCard',t);if($('wideOptDisplay'))$('wideOptDisplay').textContent=aperture($('wideOptAperture')?.value);if($('teleOptDisplay'))$('teleOptDisplay').textContent=aperture($('teleOptAperture')?.value);$('resultLine').textContent=`Wide ${signed(bw)} (${cmT(bw)}) → ${signed(w)} (${cmT(w)}). Tele ${signed(bt)} (${cmT(bt)}) → ${signed(t)} (${cmT(t)}).`}}

document.querySelectorAll('button[data-target]').forEach(b=>b.onclick=()=>{let t=$(b.dataset.target);t.value=Math.max(+t.min,Math.min(+t.max,+t.value+ +b.dataset.step));update()});document.querySelectorAll('input,select,textarea').forEach(e=>e.oninput=update);if($('reportDate'))$('reportDate').valueAsDate=new Date();if($('jobRef')&&!$('jobRef').value)$('jobRef').value='CC-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-001';
$('imageUpload').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=ev=>{imgData=ev.target.result;$('previewImage').src=imgData;$('previewImage').style.display='block';$('hint').style.display='none';$('afPoint').style.display='block'};r.readAsDataURL(f)};
let drag=false,pt=$('afPoint'),prev=$('imagePreview');pt.onpointerdown=e=>{drag=true;pt.setPointerCapture(e.pointerId)};pt.onpointerup=()=>drag=false;pt.onpointermove=e=>{if(!drag)return;let r=prev.getBoundingClientRect();af.x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));af.y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));pt.style.left=af.x+'%';pt.style.top=af.y+'%'};
async function dataURL(src){return new Promise(res=>{let im=new Image();im.crossOrigin='anonymous';im.onload=()=>{let c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);res(c.toDataURL('image/png'))};im.onerror=()=>res('');im.src=src})}
async function cameraReportImage(){return new Promise(resolve=>{const base=new Image();base.onload=()=>{const c=document.createElement('canvas');c.width=1200;c.height=760;const ctx=c.getContext('2d');ctx.fillStyle='#0b0b0b';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(base,0,0,c.width,c.height);const x=354,y=366,w=372,h=215;ctx.fillStyle='#050505';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);ctx.fillStyle='#6f256f';ctx.fillRect(x,y,w,43);ctx.fillStyle='#fff';ctx.font='bold 25px Arial';ctx.fillText('AF Microadjustment',x+20,y+29);ctx.fillStyle='#090909';ctx.fillRect(x,y+43,w,39);ctx.fillStyle='#fff';ctx.font='bold 15px Arial';ctx.fillText('[00] '+($('lensName').value||'Lens').slice(0,29),x+20,y+67);const single=$('mode').value==='single';const wVal=single?+$('singleValue').value:+$('wideValue').value;const tVal=+$('teleValue').value;function drawRow(rowY,lbl,val){ctx.fillStyle='#050505';ctx.fillRect(x,rowY,w,64);ctx.fillStyle='#fff';ctx.font='bold 28px Arial';ctx.fillText(lbl,x+18,rowY+42);ctx.fillText(signed(val),x+w-58,rowY+42);const sx=x+76,ex=x+w-78,cy=rowY+40;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx,cy);ctx.lineTo(ex,cy);ctx.stroke();ctx.font='bold 12px Arial';[-20,-10,0,10,20].forEach(n=>{const px=sx+(ex-sx)*((n+20)/40);ctx.fillText(n>0?'+'+n:String(n),px-12,rowY+18)});for(let n=-20;n<=20;n++){const px=sx+(ex-sx)*((n+20)/40);const major=n%10===0;ctx.lineWidth=n===0?3:1;ctx.beginPath();ctx.moveTo(px,cy-(major?17:9));ctx.lineTo(px,cy+(major?17:9));ctx.stroke()}const mx=sx+(ex-sx)*((val+20)/40);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(mx-9,rowY+20);ctx.lineTo(mx+9,rowY+20);ctx.lineTo(mx,rowY+35);ctx.closePath();ctx.fill()}if(single){drawRow(y+92,'AF',wVal)}else{drawRow(y+88,'W',wVal);drawRow(y+151,'T',tVal)}resolve(c.toDataURL('image/jpeg',0.92))};base.onerror=()=>resolve('');base.src='camera-base-clean.jpeg'})}
function values(){const single=$('mode').value==='single';return{single,customer:$('customerName').value||'Not supplied',ref:$('jobRef').value||'',date:$('reportDate').value||new Date().toISOString().slice(0,10),tech:$('technicianName').value||'Cameracal Services',camera:$('cameraDescription').value||'Not supplied',lens:$('lensName').value||'Not supplied',distance:($('distance').value||'10')+'m',wf:+$('wideFocal').value||24,tf:+$('teleFocal').value||70,sf:+$('singleFocal').value||70,bw:+$('beforeWide').value||0,bt:+$('beforeTele').value||0,bs:+$('beforeSingle').value||0,aw:+$('wideValue').value||0,at:+$('teleValue').value||0,as:+$('singleValue').value||0,wopt:aperture($('wideOptAperture')?.value),topt:aperture($('teleOptAperture')?.value),sopt:aperture($('singleOptAperture')?.value),notes:$('techNotes').value||'No additional notes entered.'}}
async function generateReport(){update();const v=values(),logo=await dataURL('logo-report.png')||await dataURL('logo.png'),cam=await cameraReportImage();const result=v.single?`${signed(v.as)} / ${cmT(v.as)} ${corr(v.as)}`:`Tele ${signed(v.at)} / ${cmT(v.at)} ${corr(v.at)}`;const rows=v.single?`<tr><td>Single (${v.sf}mm)</td><td>${signed(v.bs)} / ${cmT(v.bs)}<br><small>${label(v.bs)}</small></td><td>${signed(v.as)} / ${cmT(v.as)}<br><small>${label(v.as)}</small></td></tr>`:`<tr><td>Wide (${v.wf}mm)</td><td>${signed(v.bw)} / ${cmT(v.bw)}<br><small>${label(v.bw)}</small></td><td>${signed(v.aw)} / ${cmT(v.aw)}<br><small>${label(v.aw)}</small></td></tr><tr><td>Tele (${v.tf}mm)</td><td>${signed(v.bt)} / ${cmT(v.bt)}<br><small>${label(v.bt)}</small></td><td>${signed(v.at)} / ${cmT(v.at)}<br><small>${label(v.at)}</small></td></tr>`;const opt=v.single?`<tr><td>Single (${v.sf}mm)</td><td>${v.sopt}</td></tr>`:`<tr><td>Wide (${v.wf}mm)</td><td>${v.wopt}</td></tr><tr><td>Tele (${v.tf}mm)</td><td>${v.topt}</td></tr>`;const upload=imgData?`<section class="pagebreak"><h2>Image & AF Point Overlay</h2><div class="upload"><img src="${imgData}"><span style="left:${af.x}%;top:${af.y}%"></span></div></section>`:'';const html=`<!doctype html><html><head><title>Cameracal Calibration Report</title><style>@page{size:A4;margin:8mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#142033;margin:0}.cert{border:3px solid #0f4c81;border-radius:12px;padding:8mm;min-height:281mm}.top{display:flex;align-items:flex-start;border-bottom:2px solid #0f4c81;padding-bottom:7mm}.top img{width:95mm;height:auto;object-fit:contain}.title{margin-left:auto;text-align:right;color:#0f4c81}.title h1{font-size:20px;margin:0}.title p{font-size:11px;margin:4px 0}.box{border:1px solid #0f4c81;border-radius:8px;padding:5mm;margin-top:5mm}.grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm 8mm;font-size:11px}.grid b{color:#0f4c81}.twocol{display:grid;grid-template-columns:1fr 1.15fr;gap:5mm;margin-top:5mm}h2{font-size:12px;color:white;background:#0f4c81;border-radius:5px;padding:2mm 3mm;margin:0 0 3mm}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#eef5fb;color:#0f4c81}td,th{border:1px solid #cbdde8;padding:2.2mm;text-align:left;vertical-align:top}.cam img{width:100%;border-radius:6px;border:1px solid #bbb}.final{margin-top:5mm;border-radius:8px;background:#2e7d32;color:white;padding:5mm;display:flex;gap:5mm;align-items:center}.tick{width:14mm;height:14mm;border-radius:50%;background:white;color:#2e7d32;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold}.notes{min-height:24mm;font-size:10px}.quality{display:grid;grid-template-columns:20mm 1fr 60mm;gap:5mm;align-items:center;margin-top:5mm;border:1px solid #cbdde8;border-radius:8px;padding:4mm}.seal{background:#0f4c81;color:white;border-radius:50%;width:17mm;height:17mm;display:flex;align-items:center;justify-content:center;font-weight:bold}.sig{font-family:Georgia,serif;font-style:italic;font-size:18px;border-bottom:1px solid #777;padding-bottom:2mm}.footer{position:fixed;bottom:6mm;left:10mm;right:10mm;background:#0f4c81;color:white;padding:2mm 5mm;font-size:9px;display:flex;justify-content:space-between}.pagebreak{page-break-before:always;border:3px solid #0f4c81;border-radius:12px;padding:8mm;min-height:281mm}.upload{position:relative;display:inline-block;max-width:170mm}.upload img{max-width:170mm;max-height:230mm}.upload span{position:absolute;width:8mm;height:8mm;border:1mm solid red;border-radius:50%;transform:translate(-50%,-50%)}@media print{button{display:none}}</style></head><body><main class="cert"><header class="top"><img src="${logo}"><div class="title"><h1>Camera & Lens Calibration Report</h1><p>Cameracal Services</p><p><b>Reference:</b> ${esc(v.ref)}</p></div></header><section class="box"><div class="grid"><div><b>Customer:</b> ${esc(v.customer)}</div><div><b>Date:</b> ${esc(v.date)}</div><div><b>Camera:</b> ${esc(v.camera)}</div><div><b>Technician:</b> ${esc(v.tech)}</div><div><b>Lens:</b> ${esc(v.lens)}</div><div><b>Subject Distance:</b> ${esc(v.distance)}</div><div><b>Adjustment Type:</b> ${v.single?'Single':'Wide / Tele'}</div><div><b>Report ID:</b> ${esc(v.ref)}-${esc(v.date.replaceAll('-',''))}</div></div></section><section class="twocol"><div><h2>Before / After Calibration Values</h2><table><tr><th>Position</th><th>Before</th><th>After</th></tr>${rows}</table><h2 style="margin-top:5mm">Lens Optimisation Aperture</h2><table><tr><th>Position</th><th>Recommended aperture</th></tr>${opt}</table></div><div class="cam"><h2>Camera AF Microadjustment Settings</h2><img src="${cam}"><p style="font-size:9px;text-align:center;margin:1mm 0 0">Settings shown after calibration.</p></div></section><section class="twocol"><div><h2>Offset Calculation</h2><div class="box" style="margin:0;font-size:10px">1 AF microadjustment = <b>0.75 cm</b>. Positive values indicate back focus correction. Negative values indicate front focus correction.</div></div><div><h2>Technician Notes</h2><div class="box notes" style="margin:0">${esc(v.notes)}</div></div></section><section class="final"><div class="tick">✓</div><div><h3 style="margin:0 0 2mm">FINAL RESULT: CALIBRATION SUCCESSFUL</h3><p style="margin:0;font-size:11px">${esc(result)}. The camera and lens combination has been calibrated using the recorded AF microadjustment values.</p></div></section><section class="quality"><div class="seal">✓</div><div><b style="color:#0f4c81">QUALITY CERTIFIED</b><br><span style="font-size:10px">This calibration has been performed and verified using Cameracal Services procedures. Results reflect the tested camera and lens combination at the time of service.</span></div><div><b>Technician Signature</b><div class="sig">${esc(v.tech)}</div><small>Date: ${esc(v.date)}</small></div></section></main>${upload}<div class="footer"><span>© Cameracal Services 2026</span><span>www.cameracalservices.co.uk</span><span>Professional Calibration. Accurate Results.</span></div><script>window.onload=()=>setTimeout(()=>window.print(),400)</script></body></html>`;const win=window.open('','_blank');if(!win){alert('Please allow pop-ups for this site so the PDF report window can open.');return}win.document.open();win.document.write(html);win.document.close()}
$('pdfBtn').onclick=generateReport;ticks();update();


/* v15 landscape one-page certificate print override */
function cc_escape(v){
  return String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function cc_signed(v){ v=Number(v||0); return v>0?`+${v}`:`${v}`; }
function cc_cm(v){ const c=Number(v||0)*0.75; return `${c>0?'+':''}${c.toFixed(2)} cm`; }
function cc_focus(v){ v=Number(v||0); return v>0?'Back focus':v<0?'Front focus':'Correct focus'; }
function cc_ap(v){ return v && String(v).trim() ? String(v) : 'Not specified'; }
function cc_get(id){ const n=document.getElementById(id); return n ? n.value : ''; }
function cc_logo(){ const img=document.querySelector('.logo'); return img ? img.src : 'logo.png'; }
function cc_camera(){ const img=document.querySelector('.camera img, .cameraPhoto'); return img ? img.src : 'camera-base-clean.jpeg'; }
function cc_afterValues(){
  const single=cc_get('mode')==='single';
  if(single) return {mode:'single', w:Number(cc_get('singleValue')||0), t:null, wf:Number(cc_get('singleFocal')||70), tf:null};
  return {mode:'wt', w:Number(cc_get('wideValue')||0), t:Number(cc_get('teleValue')||0), wf:Number(cc_get('wideFocal')||24), tf:Number(cc_get('teleFocal')||70)};
}
function cc_printReport(){
  const single=cc_get('mode')==='single';
  const vals=cc_afterValues();
  const bw=single?Number(cc_get('beforeSingle')||0):Number(cc_get('beforeWide')||0);
  const bt=single?null:Number(cc_get('beforeTele')||0);
  const aw=vals.w, at=vals.t;
  const wf=vals.wf, tf=vals.tf;
  const logo=cc_logo();
  const camera=cc_camera();
  const today=cc_get('reportDate') || new Date().toISOString().slice(0,10);
  const ref=cc_get('jobRef') || 'CC-Report';
  const reportId=`${ref}-${today.replaceAll('-','')}`;
  const lens=cc_get('lensName') || 'Not supplied';
  const cameraDesc=cc_get('cameraDescription') || 'Not supplied';
  const technician=cc_get('technicianName') || 'Cameracal Services';
  const customer=cc_get('customerName') || 'Not supplied';
  const distance=(cc_get('distance') || '10') + 'm';
  const notes=cc_get('techNotes') || 'No additional notes entered.';
  const wideOpt=single ? cc_ap(cc_get('singleOptAperture')) : cc_ap(cc_get('wideOptAperture'));
  const teleOpt=single ? '' : cc_ap(cc_get('teleOptAperture'));

  const row2 = single ? '' : `
    <tr>
      <td><b>Tele (${tf}mm)</b></td>
      <td class="${bt<0?'red':bt>0?'green':''}">${cc_signed(bt)} / ${cc_cm(bt)}<br><span>${cc_focus(bt)}</span></td>
      <td class="${at<0?'red':at>0?'green':''}">${cc_signed(at)} / ${cc_cm(at)}<br><span>${cc_focus(at)}</span></td>
    </tr>`;

  const opt2 = single ? '' : `
    <tr><td><b>Tele (${tf}mm)</b></td><td>${teleOpt}</td></tr>`;

  const finalValues = single ? `
    <b>Single (${wf}mm):</b> <span class="${aw<0?'red':aw>0?'green':''}">${cc_signed(aw)} / ${cc_cm(aw)}</span><br><small>${cc_focus(aw)}</small>
  ` : `
    <b>Wide (${wf}mm):</b> <span class="${aw<0?'red':aw>0?'green':''}">${cc_signed(aw)} / ${cc_cm(aw)}</span><br><small>${cc_focus(aw)}</small>
    <hr>
    <b>Tele (${tf}mm):</b> <span class="${at<0?'red':at>0?'green':''}">${cc_signed(at)} / ${cc_cm(at)}</span><br><small>${cc_focus(at)}</small>
  `;

  const report = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${cc_escape(ref)} Calibration Report</title>
<style>
@page{ size:A4 landscape; margin:6mm; }
*{ box-sizing:border-box; }
body{
  margin:0;
  font-family:Arial, Helvetica, sans-serif;
  color:#101827;
  background:white;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}
.sheet{
  width:285mm;
  height:197mm;
  border:2px solid #0f4c81;
  border-radius:5mm;
  padding:6mm 8mm 7mm;
  position:relative;
  overflow:hidden;
}
.header{
  display:grid;
  grid-template-columns:82mm 1fr;
  align-items:center;
  gap:8mm;
  height:24mm;
}
.logoWrap{
  display:flex;
  align-items:center;
  justify-content:flex-start;
}
.logo{
  width:66mm;
  max-height:18mm;
  object-fit:contain;
}
.title{
  text-align:right;
  color:#0f3970;
}
.title h1{
  margin:0;
  font-size:18pt;
  line-height:1;
}
.title h2{
  margin:3mm 0 0;
  font-size:10.5pt;
}
.divider{border-top:1.5px solid #0f4c81;margin:1.5mm 0 3.5mm;}
.info{
  border:1px solid #0f4c81;
  border-radius:2mm;
  padding:3mm;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:6mm;
  font-size:8.3pt;
  margin-bottom:3mm;
}
.infoRow{display:grid;grid-template-columns:34mm 1fr;margin:0 0 2.1mm;}
.infoRow b{color:#0b3770;}
.main{
  display:grid;
  grid-template-columns:118mm 1fr;
  gap:5mm;
}
.block{
  border:1px solid #c5d3df;
  border-radius:1.5mm;
  overflow:hidden;
  margin-bottom:3mm;
}
.block h3{
  margin:0;
  padding:2.2mm 3mm;
  background:#0f4c81;
  color:white;
  font-size:9.5pt;
  text-transform:uppercase;
}
.table{
  width:100%;
  border-collapse:collapse;
  font-size:8.1pt;
}
.table th,.table td{
  border:1px solid #d7e0e8;
  padding:2.4mm;
  text-align:center;
}
.table th{
  background:#eef5fb;
  color:#0b3770;
  font-size:7.7pt;
}
.table td:first-child,.table th:first-child{text-align:left;}
.table span{font-size:7.4pt;color:#111;}
.red{color:#c62828;font-weight:700;}
.green{color:#2e7d32;font-weight:700;}
.smallBox{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:3mm;
}
.textBox{
  border:1px solid #c5d3df;
  border-radius:1.5mm;
  min-height:24mm;
  font-size:8.2pt;
}
.textBox h3{
  margin:0;
  padding:2mm 3mm;
  background:#0f4c81;
  color:white;
  font-size:9pt;
  text-transform:uppercase;
}
.textBox p{padding:3mm;margin:0;line-height:1.35;}
.cameraBlock img{
  width:100%;
  height:58mm;
  object-fit:contain;
  display:block;
  background:#111;
}
.cameraOverlay{
  position:relative;
  background:#111;
}
.afMenu{
  position:absolute;
  left:27%;
  top:42%;
  width:38%;
  height:42%;
  background:#050505;
  border:1px solid rgba(255,255,255,.35);
  color:white;
  font-size:7pt;
}
.afHead{
  background:#6f256f;
  padding:2mm;
  font-weight:700;
  font-size:10pt;
}
.afLens{padding:1.5mm 2mm;border-bottom:1px solid #333;font-weight:700;}
.afRow{display:grid;grid-template-columns:9mm 1fr 10mm;align-items:center;padding:2mm 2mm 1mm;}
.afLabel,.afVal{font-size:11pt;font-weight:700;text-align:center;}
.scale{position:relative;height:11mm;}
.scaleNums{display:flex;justify-content:space-between;font-size:6pt;margin-bottom:1mm;}
.line{position:absolute;left:0;right:0;top:6mm;border-top:1px solid white;}
.tick{position:absolute;top:4.3mm;height:3.5mm;border-left:1px solid white;}
.tick.major{height:5mm;top:3.4mm;}
.tick.zero{height:7mm;top:2.4mm;border-left-width:2px;}
.pointer{
  position:absolute;
  top:0;
  width:0;height:0;
  border-left:3px solid transparent;
  border-right:3px solid transparent;
  border-top:6px solid white;
  transform:translateX(-50%);
}
.caption{text-align:center;font-size:7.5pt;font-style:italic;margin-top:1mm;}
.final{
  border:1px solid #2e7d32;
  border-radius:2mm;
  overflow:hidden;
}
.final h3{background:#2e7d32;color:white;margin:0;padding:2.2mm 3mm;font-size:10pt;text-transform:uppercase;}
.finalBody{
  display:grid;
  grid-template-columns:17mm 1fr 40mm;
  gap:4mm;
  align-items:center;
  padding:3.5mm 4mm;
  background:#f4fbf2;
  font-size:8.1pt;
}
.check{
  width:14mm;height:14mm;border-radius:50%;background:#2e7d32;color:white;
  display:flex;align-items:center;justify-content:center;font-size:22pt;font-weight:700;
}
.final h4{margin:0 0 1mm;color:#2e7d32;font-size:12pt;}
.finalVals{
  border:1px solid #95c788;
  border-radius:1.5mm;
  background:white;
  padding:2.5mm;
  font-size:7.7pt;
}
.cert{
  position:absolute;
  left:8mm;right:8mm;bottom:15mm;
  border:1px solid #0f4c81;
  border-radius:2mm;
  padding:3mm;
  display:grid;
  grid-template-columns:34mm 1fr 55mm 55mm;
  gap:4mm;
  align-items:center;
  font-size:8pt;
}
.seal{
  width:18mm;height:18mm;border-radius:50%;background:#0f4c81;color:white;
  display:flex;align-items:center;justify-content:center;font-size:20pt;font-weight:700;margin:auto;
}
.signature{
  font-family:"Brush Script MT","Segoe Script",cursive;
  font-size:16pt;
  border-bottom:1px solid #222;
  padding-bottom:1mm;
}
.footer{
  position:absolute;
  left:0;right:0;bottom:0;
  height:10mm;
  background:#0f4c81;
  color:white;
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  align-items:center;
  padding:0 8mm;
  font-size:8pt;
}
.footer div:nth-child(2){text-align:center;}
.footer div:nth-child(3){text-align:right;}
@media print{
  html,body{width:297mm;height:210mm;}
}
</style>
</head>
<body>
<div class="sheet">
  <div class="header">
    <div class="logoWrap"><img class="logo" src="${cc_escape(logo)}"></div>
    <div class="title">
      <h1>Camera & Lens Calibration Report</h1>
      <h2>Cameracal Services</h2>
    </div>
  </div>
  <div class="divider"></div>

  <div class="info">
    <div>
      <div class="infoRow"><b>Customer:</b><span>${cc_escape(customer)}</span></div>
      <div class="infoRow"><b>Date:</b><span>${cc_escape(today)}</span></div>
      <div class="infoRow"><b>Camera:</b><span>${cc_escape(cameraDesc)}</span></div>
      <div class="infoRow"><b>Lens:</b><span>${cc_escape(lens)}</span></div>
      <div class="infoRow"><b>Subject Distance:</b><span>${cc_escape(distance)}</span></div>
      <div class="infoRow"><b>Adjustment Type:</b><span>${single?'Single':'Wide / Tele adjustment values'}</span></div>
    </div>
    <div>
      <div class="infoRow"><b>Reference:</b><span>${cc_escape(ref)}</span></div>
      <div class="infoRow"><b>Technician:</b><span>${cc_escape(technician)}</span></div>
      <div class="infoRow"><b>Mode:</b><span>${single?'Single':'Wide / Tele'}</span></div>
      <div class="infoRow"><b>Serial No:</b><span>—</span></div>
      <div class="infoRow"><b>Standard:</b><span>Cameracal AFMA Procedure v1.0</span></div>
      <div class="infoRow"><b>Report ID:</b><span>${cc_escape(reportId)}</span></div>
    </div>
  </div>

  <div class="main">
    <div>
      <div class="block">
        <h3>Before / After Calibration Values</h3>
        <table class="table">
          <tr><th>Position</th><th>Before AFMA / Offset</th><th>After AFMA / Offset</th></tr>
          <tr>
            <td><b>${single?'Single':'Wide'} (${wf}mm)</b></td>
            <td class="${bw<0?'red':bw>0?'green':''}">${cc_signed(bw)} / ${cc_cm(bw)}<br><span>${cc_focus(bw)}</span></td>
            <td class="${aw<0?'red':aw>0?'green':''}">${cc_signed(aw)} / ${cc_cm(aw)}<br><span>${cc_focus(aw)}</span></td>
          </tr>
          ${row2}
        </table>
      </div>

      <div class="block">
        <h3>Lens Optimisation Aperture (Recommended)</h3>
        <table class="table">
          <tr><th>Position</th><th>Recommended aperture</th></tr>
          <tr><td><b>${single?'Single':'Wide'} (${wf}mm)</b></td><td>${cc_escape(wideOpt)}</td></tr>
          ${opt2}
        </table>
      </div>

      <div class="smallBox">
        <div class="textBox"><h3>Offset Calculation</h3><p>1 AF microadjustment = <b>0.75 cm</b>.<br>Positive values indicate back focus correction; negative values indicate front focus correction.</p></div>
        <div class="textBox"><h3>Technician Notes</h3><p>${cc_escape(notes)}</p></div>
      </div>
    </div>

    <div>
      <div class="block cameraBlock">
        <h3>Camera AF Microadjustment Settings</h3>
        <div class="cameraOverlay">
          <img src="${cc_escape(camera)}">
          
        </div>
        <div class="caption">Settings shown after calibration.</div>
      </div>

      <div class="final">
        <h3>Final Result</h3>
        <div class="finalBody">
          <div class="check">✓</div>
          <div>
            <h4>Calibration Successful</h4>
            <div>The autofocus system has been calibrated at the specified focal length${single?'':'s'}.</div>
            <div>AF microadjustments are now optimised for improved focus accuracy.</div>
            <b>The camera is ready for accurate and reliable performance.</b>
          </div>
          <div class="finalVals">${finalValues}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="cert">
    <div class="seal">✓</div>
    <div><b>QUALITY CERTIFIED</b><br>This calibration has been performed and verified using Cameracal Services procedures.</div>
    <div><b>Technician Signature:</b><br><div class="signature">${cc_escape(technician)}</div>Date: ${cc_escape(today)}</div>
    <div><b>Reference:</b><br>${cc_escape(ref)}<br><br><b>Report ID:</b><br>${cc_escape(reportId)}</div>
  </div>

  <div class="footer">
    <div>© Cameracal Services 2026</div>
    <div>www.cameracalservices.co.uk</div>
    <div>Professional Calibration. Accurate Results.</div>
  </div>
</div>
<script>
  setTimeout(()=>window.print(),350);
</script>
</body>
</html>`;

  const win=window.open('', '_blank');
  if(!win){ alert('Please allow pop-ups to generate the PDF report.'); return; }
  win.document.open();
  win.document.write(report);
  win.document.close();
}

function cc_afMenuHtml(){ return ""; }
function cc_v17_get(id){ const n=document.getElementById(id); return n ? n.value : ''; }
function cc_v17_signed(v){ v=Number(v||0); return v>0?`+${v}`:`${v}`; }
function cc_v17_cm(v){ const c=Number(v||0)*0.75; return `${c>0?'+':''}${c.toFixed(2)} cm`; }
function cc_v17_focus(v){ v=Number(v||0); return v>0?'Back focus':v<0?'Front focus':'Correct focus'; }
function cc_v17_cls(v){ v=Number(v||0); return v>0?'green':v<0?'red':''; }
function cc_v17_ap(v){ return v && String(v).trim() ? String(v) : 'Not specified'; }
function cc_v17_logo(){ const img=document.querySelector('.logo'); return img ? img.src : 'logo.png'; }
function cc_v17_camera(){ const img=document.querySelector('.camera img, .cameraPhoto'); return img ? img.src : 'camera-base-clean.jpeg'; }

function cc_v17_afMenu(){ return ""; }
.footer{position:absolute;left:0;right:0;bottom:0;height:8mm;background:#0f4c81;color:white;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;padding:0 8mm;font-size:7.5pt}
.footer div:nth-child(2){text-align:center}.footer div:nth-child(3){text-align:right}
@media print{html,body{width:297mm;height:210mm}.sheet{page-break-after:avoid}}
</style>
</head>
<body>
<div class="sheet">
  <div class="header">
    <img class="logo" src="${cc_v17_escape(logo)}">
    <div class="title"><h1>Camera & Lens Calibration Report</h1><h2>Cameracal Services</h2></div>
  </div>

  <div class="info">
    <div>
      <div class="infoRow"><b>Customer:</b><span>${cc_v17_escape(customer)}</span></div>
      <div class="infoRow"><b>Date:</b><span>${cc_v17_escape(date)}</span></div>
      <div class="infoRow"><b>Camera:</b><span>${cc_v17_escape(cameraDesc)}</span></div>
      <div class="infoRow"><b>Lens:</b><span>${cc_v17_escape(lens)}</span></div>
      <div class="infoRow"><b>Subject Distance:</b><span>${cc_v17_escape(distance)}</span></div>
      <div class="infoRow"><b>Adjustment Type:</b><span>${single?'Single':'Wide / Tele adjustment values'}</span></div>
    </div>
    <div>
      <div class="infoRow"><b>Reference:</b><span>${cc_v17_escape(ref)}</span></div>
      <div class="infoRow"><b>Technician:</b><span>${cc_v17_escape(technician)}</span></div>
      <div class="infoRow"><b>Mode:</b><span>${single?'Single':'Wide / Tele'}</span></div>
      <div class="infoRow"><b>Serial No:</b><span>—</span></div>
      <div class="infoRow"><b>Standard:</b><span>Cameracal AFMA Procedure v1.0</span></div>
      <div class="infoRow"><b>Report ID:</b><span>${cc_v17_escape(reportId)}</span></div>
    </div>
  </div>

  <div class="content">
    <div>
      <div class="block">
        <h3>Before / After Calibration Values</h3>
        <table>
          <tr><th>Position</th><th>Before AFMA / Offset</th><th>After AFMA / Offset</th></tr>
          <tr><td><b>${single?'Single':'Wide'} (${wf}mm)</b></td><td class="${cc_v17_cls(bw)}">${cc_v17_signed(bw)} / ${cc_v17_cm(bw)}<br><small>${cc_v17_focus(bw)}</small></td><td class="${cc_v17_cls(aw)}">${cc_v17_signed(aw)} / ${cc_v17_cm(aw)}<br><small>${cc_v17_focus(aw)}</small></td></tr>
          ${teleRows}
        </table>
      </div>

      <div class="block">
        <h3>Lens Optimisation Aperture (Recommended)</h3>
        <table>
          <tr><th>Position</th><th>Recommended aperture</th></tr>
          <tr><td><b>${single?'Single':'Wide'} (${wf}mm)</b></td><td>${cc_v17_escape(wideOpt)}</td></tr>
          ${optTele}
        </table>
      </div>

      <div class="twobox">
        <div class="textbox"><h3>Offset Calculation</h3><p>1 AF microadjustment = <b>0.75 cm</b>.<br>Positive values indicate back focus correction; negative values indicate front focus correction.</p></div>
        <div class="textbox"><h3>Technician Notes</h3><p>${cc_v17_escape(notes)}</p></div>
      </div>
    </div>

    <div>
      <div class="block cameraBlock">
        <h3>Camera AF Microadjustment Settings</h3>
        <div class="cameraArea">
          <img src="${cc_v17_escape(camera)}">
          
        </div>
        <div class="caption">Settings shown after calibration.</div>
      </div>

      <div class="final">
        <h3>Final Result</h3>
        <div class="finalBody">
          <div class="check">✓</div>
          <div><h4>Calibration Successful</h4><div>The autofocus system has been calibrated at the specified focal length${single?'':'s'}.</div><div>AF microadjustments are now optimised for improved focus accuracy.</div><b>The camera is ready for accurate and reliable performance.</b></div>
          <div class="finalVals">${finalValues}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="cert">
    <div class="seal">✓</div>
    <div><b>QUALITY CERTIFIED</b><br>This calibration has been performed and verified using Cameracal Services procedures.</div>
    <div><b>Technician Signature:</b><br><div class="signature">${cc_v17_escape(technician)}</div>Date: ${cc_v17_escape(date)}</div>
    <div><b>Reference:</b><br>${cc_v17_escape(ref)}<br><br><b>Report ID:</b><br>${cc_v17_escape(reportId)}</div>
  </div>

  <div class="disclaimer">
    Calibration results reflect the tested camera and lens combination under the conditions present at the time of service. Customers are advised to independently verify autofocus accuracy and overall image performance prior to any important event, travel, assignment or commercial work.
  </div>
  <div class="footer"><div>© Cameracal Services 2026</div><div>www.cameracalservices.co.uk</div><div>Professional Calibration. Accurate Results.</div></div>
</div>
<script>setTimeout(()=>window.print(),350)</script>
</body>
</html>`;

  const win=window.open('', '_blank');
  if(!win){ alert('Please allow pop-ups to generate the PDF report.'); return; }
  win.document.open();
  win.document.write(report);
  win.document.close();
}
const __cc_v17_btn=document.getElementById('pdfBtn');
if(__cc_v17_btn){ __cc_v17_btn.onclick=cc_v17_printReport; }
