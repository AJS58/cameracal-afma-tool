const A=0.75, $=id=>document.getElementById(id);

function signed(v){v=Number(v||0);return v>0?`+${v}`:`${v}`}
function cm(v){return Number(v||0)*A}
function cmT(v){const c=cm(v);return `${c>0?'+':''}${c.toFixed(2)} cm`}
function pos(v){return ((Number(v||0)+20)/40)*100}
function focus(v){v=Number(v||0);return v>0?'Back focus':v<0?'Front focus':'Correct focus'}
function cls(v){v=Number(v||0);return v>0?'back':v<0?'front':'neutral'}
function ap(v){return v&&String(v).trim()?String(v):'Not specified'}
function esc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}

const apertureOptions=['','f/1.2','f/1.4','f/1.8','f/2','f/2.5','f/2.8','f/3.2','f/3.5','f/4','f/4.5','f/5','f/5.6','f/6.3','f/7.1','f/8','f/9','f/10','f/11','f/13','f/16'];
function populateApertures(){
  ['wideOptAperture','teleOptAperture','singleOptAperture'].forEach(id=>{
    const s=$(id); if(!s) return;
    s.innerHTML='';
    apertureOptions.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v||'Select aperture';s.appendChild(o)})
  })
}

function tickHTML(value, big=false){
  let ticks='';
  for(let n=-20;n<=20;n++){
    const cl=n===0?' zero':(n%10===0?' major':'');
    ticks+=`<i class="tick${cl}" style="left:${pos(n)}%"></i>`;
  }
  return `${ticks}<b class="ptr" style="left:${pos(value)}%"></b>`;
}
function menuRow(label,value){
  return `<div class="lbl">${label}</div><div class="miniScale"><div class="miniNums"><span>-20</span><span>-10</span><span>0</span><span>+10</span><span>+20</span></div><div class="miniRail">${tickHTML(value)}</div></div><div class="val">${signed(value)}</div>`;
}
function card(id,v){const e=$(id); if(!e)return; e.className=cls(v); e.querySelector('strong').textContent=cmT(v); e.querySelector('small').textContent=focus(v)}
function setScale(id,label,value){const r=$(id); if(!r)return; r.querySelector('b').textContent=label; r.querySelector('.bigRail').innerHTML=tickHTML(value,true); r.querySelector('span').textContent=signed(value)}

function update(){
  const single=$('mode').value==='single';
  ['wtFocals','beforeWT','afterWT','optWT','qualityWT','scaleTele'].forEach(id=>$(id)?.classList.toggle('hidden',single));
  ['singleFocalWrap','beforeSingleWrap','afterSingle','optSingle','qualitySingle'].forEach(id=>$(id)?.classList.toggle('hidden',!single));
  $('teleOptCard')?.classList.toggle('hidden',single);

  const lens=$('lensName').value||'Lens';
  $('menuLensText').textContent=lens;

  if(single){
    const b=+$('beforeSingle').value||0, a=+$('singleValue').value||0, f=+$('singleFocal').value||70;
    $('singleOutput').textContent=signed(a);
    $('rowWide').innerHTML=menuRow('AF',a);
    $('rowTele').classList.add('hidden');
    card('beforeWideCard',b); card('wideCard',a);
    $('beforeTeleCard').style.display='none'; $('teleCard').style.display='none';
    $('wideOptDisplay').textContent=ap($('singleOptAperture').value);
    $('resultLine').textContent=`Single ${signed(b)} (${cmT(b)}) → ${signed(a)} (${cmT(a)}).`;
    setScale('scaleWide','AF',a);
  }else{
    const bw=+$('beforeWide').value||0, bt=+$('beforeTele').value||0, w=+$('wideValue').value||0, t=+$('teleValue').value||0;
    $('wideOutput').textContent=signed(w); $('teleOutput').textContent=signed(t);
    $('rowWide').innerHTML=menuRow('W',w);
    $('rowTele').classList.remove('hidden');
    $('rowTele').innerHTML=menuRow('T',t);
    $('beforeTeleCard').style.display='block'; $('teleCard').style.display='block';
    card('beforeWideCard',bw); card('beforeTeleCard',bt); card('wideCard',w); card('teleCard',t);
    $('wideOptDisplay').textContent=ap($('wideOptAperture').value);
    $('teleOptDisplay').textContent=ap($('teleOptAperture').value);
    $('resultLine').textContent=`Wide ${signed(bw)} (${cmT(bw)}) → ${signed(w)} (${cmT(w)}). Tele ${signed(bt)} (${cmT(bt)}) → ${signed(t)} (${cmT(t)}).`;
    setScale('scaleWide','W',w); setScale('scaleTele','T',t);
  }
}

function init(){
  populateApertures();
  if($('reportDate')) $('reportDate').valueAsDate=new Date();
  if($('jobRef')&&!$('jobRef').value) $('jobRef').value='CC-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-001';
  document.querySelectorAll('input,select,textarea').forEach(e=>e.addEventListener('input',update));
  document.querySelectorAll('button[data-target]').forEach(b=>b.addEventListener('click',()=>{
    const t=$(b.dataset.target); t.value=Math.max(+t.min,Math.min(+t.max,+t.value+Number(b.dataset.step))); update();
  }));
  $('pdfBtn').addEventListener('click',printReport);
  update();
}

function afMenuPrint(single,w,t,lens){
  return `<div class="afmenu"><div class="afhead">AF Microadjustment</div><div class="aflens">[00] ${esc(lens).slice(0,34)}</div><div class="afrow">${menuRow(single?'AF':'W',w)}</div>${single?'':`<div class="afrow">${menuRow('T',t)}</div>`}</div>`;
}
function lp(v){return v?`${esc(v)} LP/mm`:'Not specified'}

function printReport(){
  update();
  const single=$('mode').value==='single';
  const ref=$('jobRef').value||'CC-Report', date=$('reportDate').value||new Date().toISOString().slice(0,10);
  const reportId=`${ref}-${date.replaceAll('-','')}`;
  const technician=$('technicianName').value||'Cameracal Services';
  const customer=$('customerName').value||'Not supplied', cameraDesc=$('cameraDescription').value||'Not supplied', lens=$('lensName').value||'Not supplied';
  const wf=single?(+$('singleFocal').value||70):+$('wideFocal').value||24, tf=single?null:(+$('teleFocal').value||70);
  const bw=single?(+$('beforeSingle').value||0):+$('beforeWide').value||0, bt=single?null:(+$('beforeTele').value||0);
  const aw=single?(+$('singleValue').value||0):+$('wideValue').value||0, at=single?null:(+$('teleValue').value||0);
  const wideOpt=single?ap($('singleOptAperture').value):ap($('wideOptAperture').value), teleOpt=single?'':ap($('teleOptAperture').value);
  const notes=$('techNotes').value||'No additional notes entered.';
  const cameraSrc=document.querySelector('.cameraImg').src, logo=document.querySelector('.brandLogo').src;

  const calRows = single ? '' : `<tr><td><b>Tele (${tf}mm)</b></td><td class="${cls(bt)}">${signed(bt)} / ${cmT(bt)}<br><small>${focus(bt)}</small></td><td class="${cls(at)}">${signed(at)} / ${cmT(at)}<br><small>${focus(at)}</small></td></tr>`;
  const lpRows = single ? 
    `<tr><td><b>Single (${wf}mm)</b></td><td>${lp($('singleLPBefore').value)}</td><td>${lp($('singleLPAfter').value)}</td></tr>` :
    `<tr><td><b>Wide (${wf}mm)</b></td><td>${lp($('wideLPBefore').value)}</td><td>${lp($('wideLPAfter').value)}</td></tr><tr><td><b>Tele (${tf}mm)</b></td><td>${lp($('teleLPBefore').value)}</td><td>${lp($('teleLPAfter').value)}</td></tr>`;
  const optRows = single ? '' : `<tr><td><b>Tele (${tf}mm)</b></td><td>${esc(teleOpt)}</td></tr>`;
  const finalValues = single ? `<b>Single (${wf}mm):</b><br><span class="${cls(aw)}">${signed(aw)} / ${cmT(aw)}</span><br><small>${focus(aw)}</small>` : `<b>Wide (${wf}mm):</b> <span class="${cls(aw)}">${signed(aw)} / ${cmT(aw)}</span><br><small>${focus(aw)}</small><hr><b>Tele (${tf}mm):</b> <span class="${cls(at)}">${signed(at)} / ${cmT(at)}</span><br><small>${focus(at)}</small>`;

  const report = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(ref)} Calibration Report</title><style>
@page{size:A4 landscape;margin:5mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#101827;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{width:287mm;height:200mm;border:1.7px solid #0f4c81;border-radius:4mm;padding:5mm 7mm 0;overflow:hidden;position:relative}.header{height:21mm;display:grid;grid-template-columns:74mm 1fr;align-items:center;border-bottom:1.2px solid #0f4c81;padding-bottom:2mm}.logo{width:60mm;height:15mm;object-fit:contain;object-position:left center}.title{text-align:right;color:#0f3970}.title h1{margin:0;font-size:17pt}.title h2{margin:2mm 0 0;font-size:10pt}.info{height:34mm;margin-top:3mm;border:1px solid #0f4c81;border-radius:2mm;padding:2.5mm 4mm;display:grid;grid-template-columns:1fr 1fr;gap:8mm;font-size:7.8pt}.infoRow{display:grid;grid-template-columns:35mm 1fr;margin-bottom:1.6mm}.infoRow b{color:#0b3770}.content{height:107mm;margin-top:3mm;display:grid;grid-template-columns:121mm 1fr;gap:5mm}.block{border:1px solid #c8d6e2;border-radius:1.4mm;overflow:hidden;margin-bottom:2.2mm;background:white}.block h3{margin:0;background:#0f4c81;color:white;padding:2mm 3mm;font-size:8.5pt;text-transform:uppercase}table{width:100%;border-collapse:collapse;font-size:7.25pt}th,td{border:1px solid #d7e0e8;padding:1.65mm;text-align:center;vertical-align:middle}th{background:#eef5fb;color:#0b3770;font-size:6.9pt}td:first-child,th:first-child{text-align:left}small{font-size:6.7pt;color:#111}.red,.front{color:#c62828;font-weight:700}.green,.back{color:#2e7d32;font-weight:700}.twobox{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.textbox{height:24mm;border:1px solid #c8d6e2;border-radius:1.4mm;overflow:hidden;font-size:7.1pt}.textbox h3{margin:0;background:#0f4c81;color:white;padding:1.6mm 2.5mm;font-size:8pt;text-transform:uppercase}.textbox p{margin:0;padding:2mm;line-height:1.25}.cameraBlock{height:69mm}.cameraArea{position:relative;height:61mm;overflow:hidden;background:#111}.cameraArea img{width:100%;height:100%;object-fit:contain;display:block;background:#111}.afmenu{position:absolute;left:18.6%;top:14.7%;width:51%;height:66.5%;background:#050505;color:white;border:1px solid rgba(255,255,255,.45);overflow:hidden}.afhead{height:20%;background:#6f256f;display:flex;align-items:center;padding-left:5%;font-weight:900;font-size:9.5pt}.aflens{height:18%;display:flex;align-items:center;padding:0 5%;font-weight:900;font-size:5.7pt;background:#090909;border-bottom:1px solid #333;white-space:nowrap;overflow:hidden}.afrow{height:31%;display:grid;grid-template-columns:10% 1fr 14%;align-items:center;border-bottom:1px solid #222}.afrow .lbl,.afrow .val{text-align:center;font-size:9.5pt;font-weight:900}.miniScale{position:relative;height:100%;display:flex;flex-direction:column;justify-content:center}.miniNums{display:flex;justify-content:space-between;font-size:4.6pt;font-weight:900;margin-bottom:1mm}.miniRail{position:relative;height:6mm;border-top:1px solid white}.miniRail i.tick{position:absolute;top:-1.2mm;height:2.4mm;border-left:.45px solid white}.miniRail i.major{height:3.4mm;top:-1.7mm}.miniRail i.zero{height:4.5mm;top:-2.25mm;border-left-width:1px}.miniRail b.ptr{position:absolute;top:-4.8mm;transform:translateX(-50%);width:0;height:0;border-left:2.5px solid transparent;border-right:2.5px solid transparent;border-top:5px solid white}.caption{text-align:center;font-size:7pt;font-style:italic;margin-top:1mm}.final{height:28mm;border:1px solid #2e7d32;border-radius:2mm;overflow:hidden;background:#f4fbf2}.final h3{margin:0;background:#2e7d32;color:white;padding:1.7mm 3mm;font-size:8.5pt;text-transform:uppercase}.finalBody{display:grid;grid-template-columns:14mm 1fr 41mm;gap:3mm;padding:2.5mm;font-size:7.1pt;align-items:center}.check{width:11mm;height:11mm;border-radius:50%;background:#2e7d32;color:white;font-size:17pt;font-weight:700;display:flex;align-items:center;justify-content:center}.final h4{margin:0 0 1mm;color:#2e7d32;font-size:10pt}.finalVals{border:1px solid #95c788;border-radius:1.4mm;background:white;padding:1.8mm;font-size:6.9pt}.cert{height:23mm;margin-top:2mm;border:1px solid #0f4c81;border-radius:2mm;display:grid;grid-template-columns:25mm 1fr 56mm 54mm;gap:4mm;align-items:center;padding:2.5mm;font-size:7.4pt}.seal{width:15mm;height:15mm;border-radius:50%;background:#0f4c81;color:white;font-size:18pt;font-weight:700;display:flex;align-items:center;justify-content:center;margin:auto}.signature{line-height:1;font-family:"Brush Script MT","Segoe Script",cursive;font-size:14pt;border-bottom:1px solid #222;padding-bottom:.5mm}.disclaimer{position:absolute;left:7mm;right:7mm;bottom:8.7mm;height:8mm;color:#5f6b77;font-size:6.1pt;line-height:1.25;text-align:center;padding:0 4mm}.footer{position:absolute;left:0;right:0;bottom:0;height:8mm;background:#0f4c81;color:white;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;padding:0 8mm;font-size:7.5pt}.footer div:nth-child(2){text-align:center}.footer div:nth-child(3){text-align:right}</style></head><body><div class="sheet">
<div class="header"><img class="logo" src="${esc(logo)}"><div class="title"><h1>Camera & Lens Calibration Report</h1><h2>Cameracal Services</h2></div></div>
<div class="info"><div><div class="infoRow"><b>Customer:</b><span>${esc(customer)}</span></div><div class="infoRow"><b>Date:</b><span>${esc(date)}</span></div><div class="infoRow"><b>Camera:</b><span>${esc(cameraDesc)}</span></div><div class="infoRow"><b>Lens:</b><span>${esc(lens)}</span></div><div class="infoRow"><b>Subject Distance:</b><span>${esc($('distance').value||'10')}m</span></div><div class="infoRow"><b>Adjustment Type:</b><span>${single?'Single':'Wide / Tele adjustment values'}</span></div></div><div><div class="infoRow"><b>Reference:</b><span>${esc(ref)}</span></div><div class="infoRow"><b>Technician:</b><span>${esc(technician)}</span></div><div class="infoRow"><b>Mode:</b><span>${single?'Single':'Wide / Tele'}</span></div><div class="infoRow"><b>Serial No:</b><span>—</span></div><div class="infoRow"><b>Standard:</b><span>Cameracal AFMA Procedure v1.0</span></div><div class="infoRow"><b>Report ID:</b><span>${esc(reportId)}</span></div></div></div>
<div class="content"><div><div class="block"><h3>Before / After Calibration Values</h3><table><tr><th>Position</th><th>Before AFMA / Offset</th><th>After AFMA / Offset</th></tr><tr><td><b>${single?'Single':'Wide'} (${wf}mm)</b></td><td class="${cls(bw)}">${signed(bw)} / ${cmT(bw)}<br><small>${focus(bw)}</small></td><td class="${cls(aw)}">${signed(aw)} / ${cmT(aw)}<br><small>${focus(aw)}</small></td></tr>${calRows}</table></div><div class="block"><h3>Image Resolution Performance (LP/mm)</h3><table><tr><th>Position</th><th>Before calibration</th><th>After calibration</th></tr>${lpRows}</table></div><div class="block"><h3>Lens Optimisation Aperture (Recommended)</h3><table><tr><th>Position</th><th>Recommended aperture</th></tr><tr><td><b>${single?'Single':'Wide'} (${wf}mm)</b></td><td>${esc(wideOpt)}</td></tr>${optRows}</table></div><div class="twobox"><div class="textbox"><h3>Offset Calculation</h3><p>1 AF microadjustment = <b>0.75 cm</b>.<br>Positive values indicate back focus correction; negative values indicate front focus correction.</p></div><div class="textbox"><h3>Technician Notes</h3><p>${esc(notes)}</p></div></div></div><div><div class="block cameraBlock"><h3>Camera AF Microadjustment Settings</h3><div class="cameraArea"><img src="${esc(cameraSrc)}">${afMenuPrint(single,aw,at,lens)}</div><div class="caption">Settings shown after calibration.</div></div><div class="final"><h3>Final Result</h3><div class="finalBody"><div class="check">✓</div><div><h4>Calibration Successful</h4><div>The autofocus system has been calibrated at the specified focal length${single?'':'s'}.</div><div>AF microadjustments are now optimised for improved focus accuracy and resolving performance.</div><b>The camera and lens combination is now operating within expected calibration tolerances.</b></div><div class="finalVals">${finalValues}</div></div></div></div></div>
<div class="cert"><div class="seal">✓</div><div><b>QUALITY CERTIFIED</b><br>This calibration has been performed and verified using Cameracal Services procedures.</div><div><b>Technician Signature:</b><br><div class="signature">${esc(technician)}</div>Date: ${esc(date)}</div><div><b>Reference:</b><br>${esc(ref)}<br><br><b>Report ID:</b><br>${esc(reportId)}</div></div>
<div class="disclaimer">Calibration results reflect the tested camera and lens combination under the conditions present at the time of service. Customers are advised to independently verify autofocus accuracy and overall image performance prior to any important event, travel, assignment or commercial work.</div>
<div class="footer"><div>© Cameracal Services 2026</div><div>www.cameracalservices.co.uk</div><div>Professional Calibration. Accurate Results.</div></div></div><script>setTimeout(()=>window.print(),350)</script></body></html>`;
  const win=window.open('', '_blank');
  if(!win){alert('Please allow pop-ups to generate the PDF report.');return;}
  win.document.open(); win.document.write(report); win.document.close();
}

document.addEventListener('DOMContentLoaded',init);
