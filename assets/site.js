/* Hotel Kuik - werking van de website */
(function(){
  var form=document.getElementById('aanvraag-form');
  if(!form) return;
  var totaalEl=document.getElementById('f-totaal');
  var pers=document.getElementById('f-personen');
  var datum=document.getElementById('f-datum');
  var fout=document.getElementById('f-fout');
  var knop=document.getElementById('f-verstuur');
  var bedankt=document.getElementById('f-bedankt');
  var fmt=function(v){return '€ '+v.toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');};

  // geen datum in het verleden
  var d=new Date(); datum.min=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

  function gekozen(){return Array.prototype.slice.call(form.querySelectorAll('input[name=buffet]:checked'));}
  function update(){
    var g=gekozen(); var pp=g.reduce(function(t,i){return t+parseFloat(i.dataset.prijs);},0);
    var n=parseInt(pers.value,10);
    if(!g.length){totaalEl.textContent='Nog geen buffet gekozen';}
    else if(n>0){totaalEl.innerHTML='Indicatie: <b>'+fmt(pp)+'</b> p.p. × '+n+' personen = <b>'+fmt(pp*n)+'</b>';}
    else{totaalEl.innerHTML='Indicatie: <b>'+fmt(pp)+'</b> per persoon. Vul het aantal personen in voor een totaal.';}
    document.querySelectorAll('.kies-knop[data-kies]').forEach(function(b){
      var keys=b.dataset.kies.split(' ');
      b.classList.toggle('gekozen',keys.every(function(k){var el=document.getElementById('b-'+k);return el&&el.checked;}));
    });
  }
  form.addEventListener('change',update); pers.addEventListener('input',update);

  // knoppen bij de kaarten: buffet aanvinken en naar het formulier
  document.querySelectorAll('.kies-knop[data-kies]').forEach(function(b){
    b.addEventListener('click',function(e){
      e.preventDefault();
      b.dataset.kies.split(' ').forEach(function(k){var el=document.getElementById('b-'+k); if(el) el.checked=true;});
      update();
      bedankt.hidden=true; form.hidden=false;
      document.getElementById('aanvragen').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      setTimeout(function(){datum.focus({preventScroll:true});},400);
    });
  });

  function markeer(el,bad){el.setAttribute('aria-invalid',bad?'true':'false');}
  form.addEventListener('submit',async function(e){
    e.preventDefault(); fout.hidden=true;
    var naam=document.getElementById('f-naam'), tel=document.getElementById('f-tel');
    var problemen=[];
    var okDatum=!!datum.value && datum.value>=datum.min; markeer(datum,!okDatum); if(!okDatum) problemen.push('een datum vanaf vandaag');
    var okPers=parseInt(pers.value,10)>0; markeer(pers,!okPers); if(!okPers) problemen.push('het aantal personen');
    if(!gekozen().length) problemen.push('minstens één buffet');
    var okNaam=naam.value.trim().length>1; markeer(naam,!okNaam); if(!okNaam) problemen.push('uw naam');
    var okTel=tel.value.replace(/\D/g,'').length>=9; markeer(tel,!okTel); if(!okTel) problemen.push('een telefoonnummer waarop we u kunnen bellen');
    if(problemen.length){fout.textContent='Vul nog in: '+problemen.join(', ')+'.'; fout.hidden=false; return;}

    var g=gekozen();
    var data={
      datum:datum.value, personen:parseInt(pers.value,10),
      gelegenheid:document.getElementById('f-gelegenheid').value,
      buffetten:g.map(function(i){return i.dataset.naam;}),
      prijsPerPersoon:g.reduce(function(t,i){return t+parseFloat(i.dataset.prijs);},0),
      dieet:Array.prototype.map.call(form.querySelectorAll('input[name=dieet]:checked'),function(i){return i.value;}),
      dieetToelichting:document.getElementById('f-dieet').value.trim(),
      naam:naam.value.trim(), telefoon:tel.value.trim(),
      email:document.getElementById('f-mail').value.trim(),
      belmoment:document.getElementById('f-bel').value,
      opmerkingen:document.getElementById('f-opm').value.trim(),
      status:'nieuw', ingediend:new Date().toISOString()
    };
    knop.disabled=true; knop.textContent='Bezig met versturen…';
    try{
      data.website=document.getElementById('f-website').value;
      var res=await fetch(form.getAttribute('action'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      var antw=await res.json().catch(function(){return {};});
      if(!res.ok||!antw.ok) throw new Error(antw.fout||'mislukt');
      var dt=new Date(data.datum+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
      document.getElementById('f-samenvatting').textContent=data.buffetten.join(' + ')+' voor '+data.personen+' personen op '+dt+'. We bellen u op '+data.telefoon+'.';
      form.hidden=true; bedankt.hidden=false; bedankt.focus();
    }catch(err){
      fout.textContent='Versturen lukte niet. Bel ons op +31 522 47 12 37, dan regelen we het telefonisch.'; fout.hidden=false;
    }finally{knop.disabled=false; knop.textContent='Vrijblijvend aanvragen';}
  });
  document.getElementById('f-nieuw').addEventListener('click',function(){form.reset();update();bedankt.hidden=true;form.hidden=false;datum.focus();});
  update();
})();


(function(){
  // klap je één kaart open, dan klappen alle kaarten van die buffetsoort mee open (of dicht)
  var bezig=false;
  document.querySelectorAll('.varianten').forEach(function(groep){
    var items=groep.querySelectorAll('details.inhoud');
    items.forEach(function(d){
      d.addEventListener('toggle',function(){
        if(bezig) return; bezig=true;
        items.forEach(function(o){ if(o!==d) o.open=d.open; });
        bezig=false;
      });
    });
  });
  // via een tegel of de menubalk naar een buffetsoort: die soort staat meteen open
  document.querySelectorAll('.tegel[href^="#"], .balk a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(){
      var sec=document.querySelector(a.getAttribute('href'));
      if(!sec) return; bezig=true;
      sec.querySelectorAll('details.inhoud').forEach(function(d){d.open=true;});
      bezig=false;
    });
  });
})();


(function(){


  // ---------- boekbalk: bouwt de link naar het boekingssysteem van Smarthotel ----------
  var IBE='https://ibe.smarthotel.nl/hotel/ae0d9185-175a-4b8b-92d4-86be0e005504/';
  function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function plus(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
  function lees(v){var p=v.split('-');return new Date(+p[0],p[1]-1,+p[2]);}
  var vandaag=new Date(); vandaag.setHours(0,0,0,0);
  var balken=[].slice.call(document.querySelectorAll('[data-boekbalk]'));
  balken.forEach(function(el){
    var bin=el.querySelector('[data-in]'), buit=el.querySelector('[data-uit]');
    var ovw=el.querySelector('[data-vw]'), oki=el.querySelector('[data-ki]');
    var knop=el.querySelector('[data-boek]'), info=el.querySelector('[data-info]');
    var tel={vw:2,ki:0}, grens={vw:[1,8],ki:[0,6]};
    bin.min=iso(vandaag); bin.value=iso(vandaag); buit.value=iso(plus(vandaag,2));
    function update(){
      if(!bin.value||lees(bin.value)<vandaag) bin.value=iso(vandaag);
      var din=lees(bin.value); buit.min=iso(plus(din,1));
      if(!buit.value||lees(buit.value)<=din) buit.value=iso(plus(din,1));
      var n=Math.round((lees(buit.value)-din)/864e5);
      ovw.textContent=tel.vw; oki.textContent=tel.ki;
      el.querySelectorAll('[data-min]').forEach(function(b){b.disabled=tel[b.dataset.min]<=grens[b.dataset.min][0];});
      el.querySelectorAll('[data-plus]').forEach(function(b){b.disabled=tel[b.dataset.plus]>=grens[b.dataset.plus][1];});
      knop.href=IBE+bin.value+'/'+buit.value+'/'+tel.vw+'/'+tel.ki+'/0/0/rooms';
      var dt=function(v){return lees(v).toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'});};
      info.textContent=dt(bin.value)+' tot '+dt(buit.value)+': '+n+(n===1?' nacht':' nachten')+' voor '+tel.vw+(tel.vw===1?' volwassene':' volwassenen')+(tel.ki?' en '+tel.ki+(tel.ki===1?' kind':' kinderen'):'')+'.';
    }
    el.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.dataset.min) tel[b.dataset.min]--; if(b.dataset.plus) tel[b.dataset.plus]++;
      update();
    });
    bin.addEventListener('change',update); buit.addEventListener('change',update);
    el._zet=function(start){ bin.value=iso(start); buit.value=iso(plus(start,2)); update(); };
    update();
  });

  // seizoen van nu markeren
  var m=vandaag.getMonth(); var nu=m===3?'voorjaar':(m>=4&&m<=8)?'zomer':m===9?'herfst':'winter';
  var kaart=document.querySelector('.seizoen[data-seizoen="'+nu+'"]');
  if(kaart){kaart.classList.add('nu');kaart.querySelector('.nu-tag').hidden=false;}


  // kerst: na 27 december verbergen, "andere datums" zet de boekbalk op 24 december
  var kerst=document.getElementById('kerst');
  if(vandaag>new Date(2026,11,27)){ if(kerst) kerst.hidden=true; var ks=document.querySelector('[data-kerst-strook]'); if(ks) ks.hidden=true; }
  var kd=document.querySelector('[data-kerst-datum]');
  if(kd) kd.addEventListener('click',function(){ if(arrBalk&&arrBalk._zet) arrBalk._zet(new Date(2026,11,24)); });
  // knop bij een seizoen: zet de datum op het begin van dat seizoen als dat nog moet komen
  var arrBalk=document.querySelector('#boeken [data-boekbalk]');
  document.querySelectorAll('[data-seizoen-start]').forEach(function(b){
    b.addEventListener('click',function(){
      var md=b.dataset.seizoenStart, start=new Date(vandaag);
      if(md){var p=md.split('-');var c=new Date(vandaag.getFullYear(),p[0]-1,+p[1]);var eind=new Date(c);eind.setMonth(p[0]==='04'?4:9);
        if(vandaag<c) start=c; else if(vandaag>=eind) start=new Date(vandaag.getFullYear()+1,p[0]-1,+p[1]);}
      if(arrBalk&&arrBalk._zet) arrBalk._zet(start);
    });
  });
})();

(function(){
  // Dronefilm op de homepage: alleen laden als de bezoeker beweging wil en niet op databesparing staat.
  var held=document.querySelector('[data-video]');
  if(!held) return;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var verb=navigator.connection||{};
  if(verb.saveData) return;
  if(verb.effectiveType && /(^|-)2g$/.test(verb.effectiveType)) return;
  var bron=(innerWidth<=760||verb.effectiveType==='3g') ? held.dataset.videoKlein : held.dataset.video;
  if(!bron) return;
  var v=document.createElement('video');
  v.className='held-media film'; v.muted=true; v.defaultMuted=true; v.loop=true; v.autoplay=true;
  v.playsInline=true; v.setAttribute('playsinline',''); v.setAttribute('aria-hidden','true');
  v.setAttribute('tabindex','-1'); v.preload='auto'; v.src=bron;
  v.addEventListener('playing',function(){v.classList.add('aan');},{once:true});
  v.addEventListener('error',function(){v.remove();},{once:true});
  held.insertBefore(v,held.firstChild);
  var p=v.play(); if(p&&p.catch) p.catch(function(){v.remove();});
})();
