const A=.75, $=id=>document.getElementById(id);let imgData=null,af={x:50,y:50};

function signed(v){v=+v;return v>0?`+${v}`:`${v}`}
function cm(v){return +v*A}
function cmT(v){let c=cm(v);return `${c>0?'+':''}${c.toFixed(2)} cm`}
function pos(v){return((+v+20)/40)*100}
function label(v){v=+v;return v>0?'Back focus':v<0?'Front focus':'Correct focus'}
function cls(v){v=+v;return v>0?'back':v<0?'front':'neutral'}
function corr(v){v=+v;return v>0?'back focus correction':v<0?'front focus correction':'no correction'}
function aperture(v){return v&&String(v).trim()?v:'Not specified'}

function ticks(){
  document.querySelectorAll('.ticks,.bigTicks').forEach(c=>{
    c.innerHTML='';
    for(let n=-20;n<=20;n++){
      let s=document.createElement('span');
      s.style.left=pos(n)+'%';
      if(n%10===0)s.classList.add('major');
      if(n===0)s.classList.add('zero');
      c.appendChild(s);
    }
  });
}

function card(id,v){
  let e=$(id),strong=e.querySelector('strong'),small=e.querySelector('small');
  e.className=cls(v);
  strong.textContent=cmT(v);
  small.textContent=label(v);
}

function update(){
  let single=$('mode').value==='single';

  ['wtFocals','beforeWT','afterWT','scaleT','optWT'].forEach(id=>{
    const node=$(id); if(node) node.classList.toggle('hidden',single);
  });
  ['singleFocalWrap','beforeSingleWrap','afterSingle','optSingle'].forEach(id=>{
    const node=$(id); if(node) node.classList.toggle('hidden',!single);
  });

  $('tRow').style.display=single?'none':'grid';
  $('lcdLens').textContent='[00] '+($('lensName').value||'Lens');

  if(single){
    let b=+$('beforeSingle').value||0,a=+$('singleValue').value||0,f=+$('singleFocal').value||70;
    $('wLabel').textContent='AF';
    $('scaleWLabel').textContent='AF';
    $('singleOutput').textContent=signed(a);
    $('wideMarker').style.left=pos(a)+'%';
    $('scaleWMarker').style.left=pos(a)+'%';
    $('wideLcd').textContent=signed(a);
    $('scaleWValue').textContent=signed(a);
    card('beforeWideCard',b);
    card('wideCard',a);
    $('beforeTeleCard').style.display='none';
    $('teleCard').style.display='none';
    const optDisplay=$('wideOptDisplay');
    if(optDisplay) optDisplay.textContent=aperture($('singleOptAperture')?.value);
    $('resultLine').textContent=`Before ${signed(b)} (${cmT(b)}). After ${signed(a)} at ${f}mm = ${cmT(a)} ${corr(a)}.`;
  }else{
    let bw=+$('beforeWide').value||0,bt=+$('beforeTele').value||0,w=+$('wideValue').value||0,t=+$('teleValue').value||0;
    $('wLabel').textContent='W';
    $('scaleWLabel').textContent='W';
    $('beforeTeleCard').style.display='block';
    $('teleCard').style.display='block';
    $('wideOutput').textContent=signed(w);
    $('teleOutput').textContent=signed(t);
    $('wideMarker').style.left=pos(w)+'%';
    $('teleMarker').style.left=pos(t)+'%';
    $('scaleWMarker').style.left=pos(w)+'%';
    $('scaleTMarker').style.left=pos(t)+'%';
    $('wideLcd').textContent=signed(w);
    $('teleLcd').textContent=signed(t);
    $('scaleWValue').textContent=signed(w);
    $('scaleTValue').textContent=signed(t);
    card('beforeWideCard',bw);
    card('beforeTeleCard',bt);
    card('wideCard',w);
    card('teleCard',t);
    if($('wideOptDisplay')) $('wideOptDisplay').textContent=aperture($('wideOptAperture')?.value);
    if($('teleOptDisplay')) $('teleOptDisplay').textContent=aperture($('teleOptAperture')?.value);
    $('resultLine').textContent=`Wide ${signed(bw)} (${cmT(bw)}) → ${signed(w)} (${cmT(w)}). Tele ${signed(bt)} (${cmT(bt)}) → ${signed(t)} (${cmT(t)}).`;
  }
}

document.querySelectorAll('button[data-target]').forEach(b=>b.onclick=()=>{
  let t=$(b.dataset.target);
  t.value=Math.max(+t.min,Math.min(+t.max,+t.value+ +b.dataset.step));
  update();
});
document.querySelectorAll('input,select,textarea').forEach(e=>e.oninput=update);

if($('reportDate')) $('reportDate').valueAsDate=new Date();
if($('jobRef') && !$('jobRef').value) $('jobRef').value='CC-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-001';

$('imageUpload').onchange=e=>{
  let f=e.target.files[0];if(!f)return;
  let r=new FileReader();
  r.onload=ev=>{
    imgData=ev.target.result;
    $('previewImage').src=imgData;
    $('previewImage').style.display='block';
    $('hint').style.display='none';
    $('afPoint').style.display='block';
  };
  r.readAsDataURL(f);
};

let drag=false,pt=$('afPoint'),prev=$('imagePreview');
pt.onpointerdown=e=>{drag=true;pt.setPointerCapture(e.pointerId)}
pt.onpointerup=()=>drag=false;
pt.onpointermove=e=>{
  if(!drag)return;
  let r=prev.getBoundingClientRect();
  af.x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
  af.y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));
  pt.style.left=af.x+'%';
  pt.style.top=af.y+'%';
};

async function imageDataFromSrc(src){
  return new Promise(res=>{
    let im=new Image();
    im.crossOrigin='anonymous';
    im.onload=()=>{
      let c=document.createElement('canvas');
      c.width=im.naturalWidth;
      c.height=im.naturalHeight;
      c.getContext('2d').drawImage(im,0,0);
      res(c.toDataURL('image/png'));
    };
    im.onerror=()=>res(null);
    im.src=src;
  });
}

async function cameraReportImage(){
  return new Promise(resolve=>{
    const base=new Image();
    base.onload=()=>{
      const c=document.createElement('canvas');
      c.width=1200; c.height=760;
      const ctx=c.getContext('2d');
      ctx.fillStyle='#0b0b0b';
      ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(base,0,0,c.width,c.height);

      const x=354, y=366, w=372, h=215;
      ctx.fillStyle='#050505';
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle='rgba(255,255,255,.35)';
      ctx.lineWidth=2;
      ctx.strokeRect(x,y,w,h);

      ctx.fillStyle='#6f256f';
      ctx.fillRect(x,y,w,43);
      ctx.fillStyle='#ffffff';
      ctx.font='bold 25px Arial';
      ctx.fillText('AF Microadjustment',x+20,y+29);

      ctx.fillStyle='#090909';
      ctx.fillRect(x,y+43,w,39);
      ctx.fillStyle='#ffffff';
      ctx.font='bold 15px Arial';
      const lens=($('lensName').value||'Lens').slice(0,29);
      ctx.fillText('[00] '+lens,x+20,y+67);

      const single=$('mode').value==='single';
      const wVal=single?+$('singleValue').value:+$('wideValue').value;
      const tVal=+$('teleValue').value;

      function drawRow(rowY,labelText,val){
        ctx.fillStyle='#050505';
        ctx.fillRect(x,rowY,w,64);
        ctx.fillStyle='#ffffff';
        ctx.font='bold 28px Arial';
        ctx.fillText(labelText,x+18,rowY+42);
        ctx.fillText(signed(val),x+w-58,rowY+42);

        const sx=x+76, ex=x+w-78, cy=rowY+40;
        ctx.strokeStyle='#ffffff';
        ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(sx,cy);ctx.lineTo(ex,cy);ctx.stroke();

        ctx.font='bold 12px Arial';
        [-20,-10,0,10,20].forEach(n=>{
          const px=sx+(ex-sx)*((n+20)/40);
          ctx.fillText(n>0?'+'+n:String(n),px-12,rowY+18);
        });

        for(let n=-20;n<=20;n++){
          const px=sx+(ex-sx)*((n+20)/40);
          const major=n%10===0;
          ctx.lineWidth=n===0?3:1;
          ctx.beginPath();
          ctx.moveTo(px,cy-(major?17:9));
          ctx.lineTo(px,cy+(major?17:9));
          ctx.stroke();
        }

        const mx=sx+(ex-sx)*((val+20)/40);
        ctx.fillStyle='#ffffff';
        ctx.beginPath();
        ctx.moveTo(mx-9,rowY+20);
        ctx.lineTo(mx+9,rowY+20);
        ctx.lineTo(mx,rowY+35);
        ctx.closePath();
        ctx.fill();
      }

      if(single){
        drawRow(y+92,'AF',wVal);
      }else{
        drawRow(y+88,'W',wVal);
        drawRow(y+151,'T',tVal);
      }

      resolve(c.toDataURL('image/jpeg',0.92));
    };
    base.onerror=()=>resolve(null);
    base.src='camera-base-clean.jpeg';
  });
}

function sectionHeader(doc,x,y,w,text){
  doc.setFillColor(15,76,129);
  doc.roundedRect(x,y,w,7,1.4,1.4,'F');
  doc.setFont(undefined,'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255,255,255);
  doc.text(text,x+3,y+4.8);
}

function boxed(doc,x,y,w,h){
  doc.setDrawColor(15,76,129);
  doc.setLineWidth(.35);
  doc.roundedRect(x,y,w,h,1.8,1.8);
}

async function pdf(){
  update();
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const blue=[15,76,129], green=[46,125,50], red=[198,40,40], grey=[20,32,51];
  const logo=await imageDataFromSrc('logo-report.png') || await imageDataFromSrc('logo.png');

  // Page border
  doc.setDrawColor(...blue);
  doc.setLineWidth(.7);
  doc.roundedRect(3,3,204,291,3,3);
  doc.setLineWidth(.25);
  doc.roundedRect(5,5,200,287,2,2);

  // Header
  if(logo) doc.addImage(logo,'PNG',10,8,70,18);
  doc.setTextColor(...blue);
  doc.setFont(undefined,'bold');
  doc.setFontSize(18);
  doc.text('Camera & Lens Calibration Report',196,16,{align:'right'});
  doc.setFontSize(10);
  doc.text('Cameracal Services',196,24,{align:'right'});
  doc.setLineWidth(.35);
  doc.line(10,31,200,31);

  // Details panel
  boxed(doc,10,35,190,44);
  const leftX=14, rightX=104;
  let y=43;
  doc.setFontSize(8.5);
  doc.setTextColor(...grey);

  const single=$('mode').value==='single';
  const modeText=single?'Single':'Wide / Tele';
  const reportId=($('jobRef').value||'CC-Report')+'-'+(($('reportDate').value||'').replaceAll('-','')||new Date().toISOString().slice(0,10).replaceAll('-',''));

  const left=[
    ['Customer:', $('customerName').value||'Not supplied'],
    ['Date:', $('reportDate').value||new Date().toISOString().slice(0,10)],
    ['Camera:', $('cameraDescription').value||'Not supplied'],
    ['Lens:', $('lensName').value||'Not supplied'],
    ['Subject Distance:', ($('distance').value||'10')+'m'],
    ['Adjustment Type:', single?'Single adjustment value':'Wide / Tele adjustment values']
  ];
  const right=[
    ['Reference:', $('jobRef').value||''],
    ['Technician:', $('technicianName').value||'Cameracal Services'],
    ['Mode:', modeText],
    ['Calibration Standard:', 'Cameracal AFMA Procedure v1.0'],
    ['Report ID:', reportId]
  ];

  function detailRows(rows,x,startY){
    let yy=startY;
    rows.forEach(r=>{
      doc.setFont(undefined,'bold'); doc.setTextColor(...blue); doc.text(r[0],x,yy);
      doc.setFont(undefined,'normal'); doc.setTextColor(...grey); doc.text(String(r[1]),x+34,yy,{maxWidth:55});
      yy+=6;
    });
  }
  detailRows(left,leftX,43);
  doc.setDrawColor(180,180,180); doc.line(100,39,100,75);
  detailRows(right,rightX,43);

  // Values table
  const tableX=10, tableY=84, tableW=83;
  sectionHeader(doc,tableX,tableY,tableW,'BEFORE / AFTER CALIBRATION VALUES');
  boxed(doc,tableX,tableY+7,tableW,33);
  doc.setFontSize(7.3); doc.setFont(undefined,'bold'); doc.setTextColor(...blue);
  doc.text('POSITION',tableX+3,tableY+15);
  doc.text('BEFORE AFMA / OFFSET',tableX+28,tableY+15);
  doc.text('AFTER AFMA / OFFSET',tableX+57,tableY+15);
  doc.setDrawColor(210,210,210);
  doc.line(tableX,tableY+18,tableX+tableW,tableY+18);
  doc.line(tableX+25,tableY+7,tableX+25,tableY+40);
  doc.line(tableX+55,tableY+7,tableX+55,tableY+40);

  function tableRow(label,b,a,yy){
    doc.setFontSize(7.5); doc.setFont(undefined,'bold'); doc.setTextColor(...grey); doc.text(label,tableX+3,yy);
    doc.setFont(undefined,'bold'); doc.setTextColor(b<0?red:green); doc.text(`${signed(b)} / ${cmT(b)}`,tableX+30,yy,{align:'left'});
    doc.setFont(undefined,'normal'); doc.setTextColor(...grey); doc.text(`(${label?focusShort(b):''})`,tableX+33,yy+4);
    doc.setFont(undefined,'bold'); doc.setTextColor(a<0?red:green); doc.text(`${signed(a)} / ${cmT(a)}`,tableX+59,yy,{align:'left'});
    doc.setFont(undefined,'normal'); doc.setTextColor(...grey); doc.text(`(${focusShort(a)})`,tableX+62,yy+4);
  }
  function focusShort(v){v=+v;return v>0?'Back focus':v<0?'Front focus':'Correct'}
  if(single){
    tableRow(`Single (${$('singleFocal').value||70}mm)`,+$('beforeSingle').value||0,+$('singleValue').value||0,tableY+27);
  }else{
    tableRow(`Wide (${$('wideFocal').value||24}mm)`,+$('beforeWide').value||0,+$('wideValue').value||0,tableY+27);
    doc.line(tableX,tableY+29.5,tableX+tableW,tableY+29.5);
    tableRow(`Tele (${$('teleFocal').value||70}mm)`,+$('beforeTele').value||0,+$('teleValue').value||0,tableY+37);
  }

  // Camera image
  const camX=99, camY=84, camW=101, camH=63;
  sectionHeader(doc,camX,camY,camW,'CAMERA AF MICROADJUSTMENT SETTINGS');
  const cam=await cameraReportImage();
  if(cam) doc.addImage(cam,'JPEG',camX,camY+8,camW,56);
  doc.setFontSize(7); doc.setFont(undefined,'italic'); doc.setTextColor(...grey);
  doc.text('Settings shown after calibration.',camX+camW/2,camY+68,{align:'center'});

  // Lens optimisation
  const optY=128;
  sectionHeader(doc,tableX,optY,tableW,'LENS OPTIMISATION APERTURE (RECOMMENDED)');
  boxed(doc,tableX,optY+7,tableW,30);
  doc.setFontSize(7.2); doc.setFont(undefined,'bold'); doc.setTextColor(...blue);
  doc.text('POSITION',tableX+3,optY+15);
  doc.text('OPTIMISED APERTURE',tableX+46,optY+15);
  doc.setDrawColor(210,210,210); doc.line(tableX,optY+18,tableX+tableW,optY+18); doc.line(tableX+40,optY+7,tableX+40,optY+37);
  doc.setFont(undefined,'bold'); doc.setTextColor(...grey);
  if(single){
    doc.text(`Single (${$('singleFocal').value||70}mm)`,tableX+3,optY+27);
    doc.text(aperture($('singleOptAperture')?.value),tableX+55,optY+27);
  }else{
    doc.text(`Wide (${$('wideFocal').value||24}mm)`,tableX+3,optY+27);
    doc.text(aperture($('wideOptAperture')?.value),tableX+55,optY+27);
    doc.line(tableX,optY+29.5,tableX+tableW,optY+29.5);
    doc.text(`Tele (${$('teleFocal').value||70}mm)`,tableX+3,optY+36);
    doc.text(aperture($('teleOptAperture')?.value),tableX+55,optY+36);
  }

  // Offset calculation and notes
  const calcY=164;
  sectionHeader(doc,10,calcY,40,'OFFSET CALCULATION');
  boxed(doc,10,calcY+7,40,28);
  doc.setFont(undefined,'normal'); doc.setFontSize(7.8); doc.setTextColor(...grey);
  doc.text('1 AF microadjustment = 0.75 cm. Positive values indicate back focus correction; negative values indicate front focus correction.',13,calcY+15,{maxWidth:34});

  sectionHeader(doc,53,calcY,40,'TECHNICIAN NOTES');
  boxed(doc,53,calcY+7,40,28);
  doc.text($('techNotes').value||'No additional notes entered.',56,calcY+15,{maxWidth:34});

  // Final result panel
  const finalX=99, finalY=155, finalW=101, finalH=44;
  doc.setFillColor(...green);
  doc.roundedRect(finalX,finalY,finalW,7,1.4,1.4,'F');
  doc.setTextColor(255,255,255); doc.setFont(undefined,'bold'); doc.setFontSize(9);
  doc.text('FINAL RESULT',finalX+3,finalY+5);
  boxed(doc,finalX,finalY+7,finalW,finalH-7);
  doc.setTextColor(...green); doc.setFontSize(12);
  doc.text('CALIBRATION SUCCESSFUL',finalX+22,finalY+19);
  doc.setTextColor(...grey); doc.setFont(undefined,'normal'); doc.setFontSize(8);
  const successText = single
    ? `The autofocus system has been calibrated at ${$('singleFocal').value||70}mm.`
    : `The autofocus system has been calibrated at the wide (${$('wideFocal').value||24}mm) and tele (${$('teleFocal').value||70}mm) focal lengths.`;
  doc.text(successText,finalX+22,finalY+27,{maxWidth:70});
  doc.setFont(undefined,'bold');
  doc.text('The camera is ready for accurate and reliable performance.',finalX+22,finalY+39,{maxWidth:70});
  // simple check icon
  doc.setFillColor(...green);
  doc.circle(finalX+12,finalY+25,8,'F');
  doc.setDrawColor(255,255,255); doc.setLineWidth(1.6);
  doc.line(finalX+8,finalY+25,finalX+11,finalY+29);
  doc.line(finalX+11,finalY+29,finalX+17,finalY+20);

  // Optional uploaded image with AF point if present, page 2 if needed
  if(imgData){
    doc.addPage();
    doc.setDrawColor(...blue); doc.roundedRect(5,5,200,287,2,2);
    if(logo) doc.addImage(logo,'PNG',10,9,70,18);
    doc.setTextColor(...blue); doc.setFont(undefined,'bold'); doc.setFontSize(16);
    doc.text('Image & AF Point Overlay',196,18,{align:'right'});
    doc.line(10,32,200,32);
    doc.setTextColor(...grey); doc.setFont(undefined,'normal'); doc.setFontSize(9);
    doc.text('Uploaded image with manually positioned AF point marker.',10,42);
    try{
      doc.addImage(imgData,'JPEG',10,50,150,100);
      const px=10+(af.x/100)*150, py=50+(af.y/100)*100;
      doc.setDrawColor(255,0,0); doc.setLineWidth(.8);
      doc.circle(px,py,3);
      doc.line(px-5,py,px+5,py);
      doc.line(px,py-5,px,py+5);
    }catch(e){}
  }

  // Certificate block
  const certY=214;
  boxed(doc,10,certY,190,34);
  doc.setTextColor(...blue); doc.setFont(undefined,'bold'); doc.setFontSize(9);
  doc.text('QUALITY CERTIFIED',31,certY+9);
  doc.setTextColor(...grey); doc.setFont(undefined,'normal'); doc.setFontSize(7.8);
  doc.text('This calibration has been performed and verified using Cameracal Services procedures. Results reflect the tested camera and lens combination at the time of service.',31,certY+16,{maxWidth:55});

  // simple seal
  doc.setFillColor(...blue);
  doc.circle(20,certY+17,9,'F');
  doc.setDrawColor(255,255,255); doc.setLineWidth(1.2);
  doc.circle(20,certY+17,5);
  doc.line(17,certY+17,19,certY+20);
  doc.line(19,certY+20,24,certY+14);

  doc.setDrawColor(210,210,210); doc.line(78,certY+4,78,certY+30);
  doc.setTextColor(...blue); doc.setFont(undefined,'bold'); doc.text('Technician Signature:',84,certY+9);
  doc.setFont('times','italic'); doc.setFontSize(17); doc.setTextColor(20,32,51);
  doc.text($('technicianName').value||'Cameracal Services',84,certY+22);
  doc.setFont('helvetica','normal'); doc.setDrawColor(...grey); doc.line(84,certY+25,128,certY+25);
  doc.setFontSize(8); doc.text('Date: '+(($('reportDate').value)||new Date().toISOString().slice(0,10)),84,certY+30);

  doc.setDrawColor(210,210,210); doc.line(135,certY+4,135,certY+30);
  doc.setTextColor(...blue); doc.setFont(undefined,'bold'); doc.text('Reference:',142,certY+9);
  doc.setTextColor(...grey); doc.setFont(undefined,'normal'); doc.text($('jobRef').value||'',142,certY+15);
  doc.setTextColor(...blue); doc.setFont(undefined,'bold'); doc.text('Report ID:',142,certY+23);
  doc.setTextColor(...grey); doc.setFont(undefined,'normal'); doc.text(reportId,142,certY+29,{maxWidth:50});

  // Footer
  doc.setFillColor(...blue);
  doc.rect(5,281,200,9,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(8);
  doc.text('© Cameracal Services 2026',10,287);
  doc.text('www.cameracalservices.co.uk',105,287,{align:'center'});
  doc.text('Professional Calibration. Accurate Results.',200,287,{align:'right'});

  doc.save(($('jobRef').value||'Cameracal')+'-AFMA-Report.pdf');
}

$('pdfBtn').onclick=pdf;
ticks();
update();
