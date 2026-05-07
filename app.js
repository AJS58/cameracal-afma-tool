const A=.75, $=id=>document.getElementById(id);let imgData=null,af={x:50,y:50};
function signed(v){v=+v;return v>0?`+${v}`:`${v}`}function cm(v){return +v*A}function cmT(v){let c=cm(v);return `${c>0?'+':''}${c.toFixed(2)} cm`}function pos(v){return((+v+20)/40)*100}function label(v){v=+v;return v>0?'Back focus':v<0?'Front focus':'Correct focus'}function cls(v){v=+v;return v>0?'back':v<0?'front':'neutral'}function corr(v){v=+v;return v>0?'back focus correction':v<0?'front focus correction':'no correction'}function aperture(v){return v&&v.trim()?v:'Not specified'}
function ticks(){document.querySelectorAll('.ticks,.bigTicks').forEach(c=>{c.innerHTML='';for(let n=-20;n<=20;n++){let s=document.createElement('span');s.style.left=pos(n)+'%';if(n%10===0)s.classList.add('major');if(n===0)s.classList.add('zero');c.appendChild(s)}})}
function card(id,v){let e=$(id),strong=e.querySelector('strong'),small=e.querySelector('small');e.className=cls(v);strong.textContent=cmT(v);small.textContent=label(v)}
function update(){let single=$('mode').value==='single';['wtFocals','beforeWT','afterWT','scaleT','optWT'].forEach(id=>$(id).classList.toggle('hidden',single));['singleFocalWrap','beforeSingleWrap','afterSingle','optSingle'].forEach(id=>$(id).classList.toggle('hidden',!single));$('tRow').style.display=single?'none':'grid';$('lcdLens').textContent='[00] '+($('lensName').value||'Lens');
if(single){let b=+$('beforeSingle').value||0,a=+$('singleValue').value||0,f=+$('singleFocal').value||70;$('wLabel').textContent='AF';$('scaleWLabel').textContent='AF';$('singleOutput').textContent=signed(a);$('wideMarker').style.left=pos(a)+'%';$('scaleWMarker').style.left=pos(a)+'%';$('wideLcd').textContent=signed(a);$('scaleWValue').textContent=signed(a);card('beforeWideCard',b);card('wideCard',a);$('beforeTeleCard').style.display='none';$('teleCard').style.display='none';$('wideOptDisplay').textContent=aperture($('singleOptAperture').value);$('resultLine').textContent=`Before ${signed(b)} (${cmT(b)}). After ${signed(a)} at ${f}mm = ${cmT(a)} ${corr(a)}.`}
else{let bw=+$('beforeWide').value||0,bt=+$('beforeTele').value||0,w=+$('wideValue').value||0,t=+$('teleValue').value||0,wf=+$('wideFocal').value||24,tf=+$('teleFocal').value||70;$('wLabel').textContent='W';$('scaleWLabel').textContent='W';$('beforeTeleCard').style.display='block';$('teleCard').style.display='block';$('wideOutput').textContent=signed(w);$('teleOutput').textContent=signed(t);$('wideMarker').style.left=pos(w)+'%';$('teleMarker').style.left=pos(t)+'%';$('scaleWMarker').style.left=pos(w)+'%';$('scaleTMarker').style.left=pos(t)+'%';$('wideLcd').textContent=signed(w);$('teleLcd').textContent=signed(t);$('scaleWValue').textContent=signed(w);$('scaleTValue').textContent=signed(t);card('beforeWideCard',bw);card('beforeTeleCard',bt);card('wideCard',w);card('teleCard',t);$('wideOptDisplay').textContent=aperture($('wideOptAperture').value);$('teleOptDisplay').textContent=aperture($('teleOptAperture').value);$('resultLine').textContent=`Wide ${signed(bw)} (${cmT(bw)}) → ${signed(w)} (${cmT(w)}). Tele ${signed(bt)} (${cmT(bt)}) → ${signed(t)} (${cmT(t)}).`}}
document.querySelectorAll('button[data-target]').forEach(b=>b.onclick=()=>{let t=$(b.dataset.target);t.value=Math.max(+t.min,Math.min(+t.max,+t.value+ +b.dataset.step));update()});document.querySelectorAll('input,select,textarea').forEach(e=>e.oninput=update);
$('reportDate').valueAsDate=new Date();$('jobRef').value='CC-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-001';
$('imageUpload').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=ev=>{imgData=ev.target.result;$('previewImage').src=imgData;$('previewImage').style.display='block';$('hint').style.display='none';$('afPoint').style.display='block'};r.readAsDataURL(f)};
let drag=false,pt=$('afPoint'),prev=$('imagePreview');pt.onpointerdown=e=>{drag=true;pt.setPointerCapture(e.pointerId)};pt.onpointerup=()=>drag=false;pt.onpointermove=e=>{if(!drag)return;let r=prev.getBoundingClientRect();af.x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));af.y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));pt.style.left=af.x+'%';pt.style.top=af.y+'%'};
async function logoData(){return new Promise(res=>{let im=new Image();im.onload=()=>{let c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);res(c.toDataURL('image/png'))};im.onerror=()=>res(null);im.src='logo.png'})}

async function cameraReportImage(){
  return new Promise(resolve=>{
    const base=new Image();
    base.onload=()=>{
      const c=document.createElement('canvas');
      c.width=1200;
      c.height=760;
      const ctx=c.getContext('2d');

      // background
      ctx.fillStyle='#0b0b0b';
      ctx.fillRect(0,0,c.width,c.height);

      // draw camera image as background
      ctx.drawImage(base,0,0,c.width,c.height);

      // LCD menu panel
      const x=355, y=372, w=360, h=205;
      ctx.fillStyle='#050505';
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle='rgba(255,255,255,.35)';
      ctx.lineWidth=2;
      ctx.strokeRect(x,y,w,h);

      // header
      ctx.fillStyle='#6f256f';
      ctx.fillRect(x,y,w,42);
      ctx.fillStyle='#ffffff';
      ctx.font='bold 25px Arial';
      ctx.fillText('AF Microadjustment',x+20,y+29);

      // lens row
      ctx.fillStyle='#090909';
      ctx.fillRect(x,y+42,w,38);
      ctx.fillStyle='#ffffff';
      ctx.font='bold 15px Arial';
      const lens=($('lensName').value||'Lens').slice(0,28);
      ctx.fillText('[00] '+lens,x+20,y+66);

      const single=$('mode').value==='single';
      const wideVal=single?+$('singleValue').value:+$('wideValue').value;
      const teleVal=+$('teleValue').value;

      function drawRow(rowY,label,val){
        ctx.fillStyle='#050505';
        ctx.fillRect(x,rowY,w,62);
        ctx.fillStyle='#ffffff';
        ctx.font='bold 28px Arial';
        ctx.fillText(label,x+18,rowY+42);
        ctx.fillText(signed(val),x+w-54,rowY+42);

        const sx=x+75, ex=x+w-75, cy=rowY+39;

        ctx.strokeStyle='#ffffff';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(sx,cy);
        ctx.lineTo(ex,cy);
        ctx.stroke();

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
        drawRow(y+86,'AF',wideVal);
      }else{
        drawRow(y+86,'W',wideVal);
        drawRow(y+145,'T',teleVal);
      }

      resolve(c.toDataURL('image/jpeg',0.92));
    };
    base.onerror=()=>resolve(null);
    base.src='camera-base-clean.jpeg';
  });
}

async function pdf(){update();const{jsPDF}=window.jspdf,doc=new jsPDF();let logo=await logoData(),blue=[15,76,129];if(logo)doc.addImage(logo,'PNG',14,8,92,19.7);doc.setTextColor(...blue);doc.setFontSize(16);doc.text('Camera & Lens Calibration Report',196,18,{align:'right'});doc.setFontSize(10);doc.text('Cameracal Services',196,25,{align:'right'});doc.line(14,34,196,34);doc.setTextColor(20,32,51);doc.setFontSize(10);let y=46,details=[['Customer',$('customerName').value||'Not supplied'],['Reference',$('jobRef').value],['Date',$('reportDate').value],['Technician',$('technicianName').value],['Camera',$('cameraDescription').value||'Not supplied'],['Lens',$('lensName').value],['Distance',$('distance').value+'m'],['Mode',$('mode').value==='single'?'Single':'Wide / Tele']];for(let i=0;i<details.length;i+=2){doc.setFont(undefined,'bold');doc.text(details[i][0]+':',14,y);doc.setFont(undefined,'normal');doc.text(details[i][1],42,y);if(details[i+1]){doc.setFont(undefined,'bold');doc.text(details[i+1][0]+':',110,y);doc.setFont(undefined,'normal');doc.text(details[i+1][1],138,y)}y+=8}y+=7;doc.setFillColor(...blue);doc.rect(14,y,182,8,'F');doc.setTextColor(255,255,255);doc.setFont(undefined,'bold');doc.text('Before / After Calibration Values',17,y+5.5);y+=15;doc.setTextColor(20,32,51);doc.text('Position',17,y);doc.text('Before AFMA / Offset',58,y);doc.text('After AFMA / Offset',122,y);y+=7;function row(name,b,a){doc.setFont(undefined,'normal');doc.text(name,17,y);doc.text(`${signed(b)} / ${cmT(b)} (${label(b)})`,58,y);doc.text(`${signed(a)} / ${cmT(a)} (${label(a)})`,122,y);y+=10}if($('mode').value==='single')row('Single',+$('beforeSingle').value,+$('singleValue').value);else{row('Wide',+$('beforeWide').value,+$('wideValue').value);row('Tele',+$('beforeTele').value,+$('teleValue').value)}y+=6;doc.setTextColor(...blue);doc.setFont(undefined,'bold');doc.text('Lens Optimisation Aperture',14,y);y+=7;doc.setTextColor(20,32,51);doc.setFont(undefined,'normal');if($('mode').value==='single'){doc.text(`Single optimum aperture: ${aperture($('singleOptAperture').value)}`,14,y);y+=8}else{doc.text(`Wide optimum aperture: ${aperture($('wideOptAperture').value)}`,14,y);doc.text(`Tele optimum aperture: ${aperture($('teleOptAperture').value)}`,110,y);y+=8}y+=4;doc.setTextColor(...blue);doc.setFont(undefined,'bold');doc.text('Offset calculation',14,y);y+=7;doc.setTextColor(20,32,51);doc.setFont(undefined,'normal');doc.text('1 AF microadjustment = 0.75 cm. Positive values indicate back focus correction; negative values indicate front focus correction.',14,y,{maxWidth:180});y+=18;doc.setFont(undefined,'bold');doc.text('Technician Notes',14,y);y+=6;doc.setFont(undefined,'normal');doc.text($('techNotes').value||'No additional notes entered.',14,y,{maxWidth:180});y+=28;const camImg=await cameraReportImage();
 if(camImg){
   doc.setTextColor(...blue);
   doc.setFont(undefined,'bold');
   doc.text('Camera AF Microadjustment Settings',14,y);
   y+=5;
   doc.addImage(camImg,'JPEG',14,y,88,56);
   y+=63;
 }

 doc.setFillColor(46,125,50);
 doc.roundedRect(14,y,182,20,3,3,'F');
 doc.setTextColor(255,255,255);
 doc.setFont(undefined,'bold');
 doc.setFontSize(12);
 doc.text('FINAL RESULT: CALIBRATION SUCCESSFUL',18,y+8);
 doc.setFontSize(9);
 doc.text('The camera and lens combination has been calibrated using the recorded AF microadjustment values.',18,y+15);
 y+=28;
 doc.setTextColor(20,32,51);
 doc.setFontSize(10);

 if(imgData){doc.setFont(undefined,'bold');doc.text('Uploaded Image & AF Point Overlay',14,y);y+=6;try{doc.addImage(imgData,'JPEG',14,y,90,60);let px=14+af.x/100*90,py=y+af.y/100*60;doc.setDrawColor(255,0,0);doc.circle(px,py,2.5);doc.line(px-4,py,px+4,py);doc.line(px,py-4,px,py+4)}catch(e){}}doc.setDrawColor(...blue);doc.line(14,270,196,270);doc.setFontSize(9);doc.setTextColor(100,100,100);doc.text('© Cameracal Services 2026',14,278);doc.text('www.cameracalservices.co.uk',196,278,{align:'right'});doc.save(($('jobRef').value||'Cameracal')+'-AFMA-Report.pdf')}
$('pdfBtn').onclick=pdf;ticks();update();