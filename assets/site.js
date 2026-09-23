(function(){
  var body=document.body;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // intro (home page only)
  var intro=document.getElementById('intro');
  function showHero(){document.querySelectorAll('.hero .reveal').forEach(function(el){el.classList.add('in')})}
  if(intro){
    var shown=false; try{shown=sessionStorage.getItem('fs-intro')==='1'}catch(e){}
    setTimeout(function(){
      intro.classList.add('done'); body.classList.remove('loading'); showHero();
      setTimeout(function(){intro.remove()},1100);
      try{sessionStorage.setItem('fs-intro','1')}catch(e){}
    },(reduce||shown)?400:3200);
  } else showHero();

  // falling leaves
  var box=document.querySelector('.hero .leaves');
  if(box&&!reduce){
    for(var i=0;i<9;i++){
      var s=document.createElementNS('http://www.w3.org/2000/svg','svg');
      s.setAttribute('class','leaf');
      s.innerHTML='<use href="#leafs"/>';
      var size=24+Math.random()*40;
      s.style.cssText='left:'+(Math.random()*100)+'%;top:-10%;width:'+size+'px;height:'+size+'px;animation-duration:'+(14+Math.random()*14)+'s;animation-delay:-'+(Math.random()*20)+'s';
      box.appendChild(s);
    }
  }

  // header
  var header=document.getElementById('top');
  function onScroll(){header.classList.toggle('scrolled',window.scrollY>40)}
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // mobile nav
  var burger=document.querySelector('.burger');
  function closeNav(){body.classList.remove('nav-open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu')}
  burger.addEventListener('click',function(){
    var open=body.classList.toggle('nav-open'); burger.setAttribute('aria-expanded',open); burger.setAttribute('aria-label',open?'Close menu':'Open menu');
  });
  document.querySelectorAll('.menu a').forEach(function(a){a.addEventListener('click',closeNav)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeNav()});
  window.addEventListener('resize',function(){if(window.innerWidth>820)closeNav()});

  // reveal on scroll
  var els=document.querySelectorAll('.reveal:not(.hero .reveal)');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
    },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){io.observe(el)});
  } else els.forEach(function(el){el.classList.add('in')});

  // filter tabs (services + gallery)
  document.querySelectorAll('[data-filter]').forEach(function(bar){
    var tabs=bar.querySelectorAll('.tab'), items=document.querySelectorAll(bar.dataset.filter);
    tabs.forEach(function(t){t.addEventListener('click',function(){
      tabs.forEach(function(x){x.classList.remove('active')}); t.classList.add('active');
      items.forEach(function(c,i){
        var show=t.dataset.f==='all'||c.dataset.c===t.dataset.f;
        c.classList.toggle('hide',!show);
        if(show){c.classList.remove('in'); void c.offsetWidth; setTimeout(function(){c.classList.add('in')},30*(i%8))}
      });
    })});
  });

  // quote form -> email
  var form=document.getElementById('quote');
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(this);
    var subject='Quote request: '+d.get('service')+' ('+d.get('name')+')';
    var text='Name: '+d.get('name')+'\nPhone: '+d.get('phone')+'\nArea: '+d.get('area')+'\nService: '+d.get('service')+'\n\n'+d.get('msg');
    window.location.href='mailto:Fivestarhomeimprovements701@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text);
  });

  // gallery lightbox
  var lb=document.getElementById('lb');
  if(lb){
    var gItems=[].slice.call(document.querySelectorAll('.gal-item'));
    var lbImg=lb.querySelector('img'), lbCap=lb.querySelector('p'), cur=0;
    function vis(){return gItems.filter(function(g){return !g.classList.contains('hide')})}
    function show(i){var v=vis(); cur=(i+v.length)%v.length; var im=v[cur].querySelector('img'); lbImg.src=im.src; lbImg.alt=im.alt; lbCap.textContent=im.alt}
    function openLb(g){lb.classList.add('open'); body.style.overflow='hidden'; show(vis().indexOf(g)); lb.querySelector('.x').focus()}
    function closeLb(){lb.classList.remove('open'); body.style.overflow=''}
    gItems.forEach(function(g){
      g.addEventListener('click',function(){openLb(g)});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openLb(g)}});
    });
    lb.querySelector('.x').onclick=closeLb;
    lb.querySelector('.pv').onclick=function(){show(cur-1)};
    lb.querySelector('.nx').onclick=function(){show(cur+1)};
    lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
    document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return; if(e.key==='Escape')closeLb(); if(e.key==='ArrowLeft')show(cur-1); if(e.key==='ArrowRight')show(cur+1)});
    var tx=0; lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx; if(Math.abs(d)>50)show(cur+(d<0?1:-1))});
  }

  // before / after driveway cleaning
  var ba=document.getElementById('ba');
  if(ba){
  var range=ba.querySelector('input');
  var cClean=ba.querySelector('.clean-c'), cDirty=ba.querySelector('.dirty');
  function rng(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}}
  function paint(){
    var dpr=Math.min(window.devicePixelRatio||1,2), W=ba.clientWidth, H=ba.clientHeight;
    [cClean,cDirty].forEach(function(c){c.width=W*dpr;c.height=H*dpr});
    drawDrive(cClean.getContext('2d'),W,H,dpr,false);
    drawDrive(cDirty.getContext('2d'),W,H,dpr,true);
  }
  function drawDrive(ctx,W,H,dpr,dirty){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var r=rng(42), grass=H*.16, bw=Math.max(W/11,34), bh=bw/2, j=2.5;
    // lawn
    var g=ctx.createLinearGradient(0,0,0,grass); g.addColorStop(0,dirty?'#56692f':'#4f8f2c'); g.addColorStop(1,dirty?'#43561f':'#3f7a22');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,grass);
    for(var i=0;i<W;i+=3){ctx.strokeStyle='rgba(20,60,10,'+(.2+r()*.3)+')';ctx.beginPath();ctx.moveTo(i,grass);ctx.lineTo(i+(r()-.5)*4,grass-4-r()*10);ctx.stroke()}
    // kerb
    ctx.fillStyle=dirty?'#3b3b38':'#4a4d52'; ctx.fillRect(0,grass,W,bh*.8);
    for(var k=0;k<W;k+=bw*.7){ctx.fillStyle=dirty?'#2a2a27':'#3a3d42';ctx.fillRect(k,grass,1.5,bh*.8)}
    // sand joints base
    var top=grass+bh*.8;
    ctx.fillStyle=dirty?'#4a4a3a':'#d8c9a3'; ctx.fillRect(0,top,W,H-top);
    var cols=['#b0584a','#9c4c42','#c47a5a','#8d8a86','#a9a39a','#b8876a','#7f7c78','#c9a07a'];
    var blocks=[];
    for(var y=top,row=0;y<H;y+=bh,row++){
      for(var x=(row%2?-bw/2:0);x<W;x+=bw){
        var c=cols[Math.floor(r()*cols.length)];
        blocks.push([x,y,c]);
        ctx.fillStyle=c; ctx.fillRect(x+j/2,y+j/2,bw-j,bh-j);
        // texture / bevel
        var sh=ctx.createLinearGradient(x,y,x,y+bh); sh.addColorStop(0,'rgba(255,255,255,.18)'); sh.addColorStop(1,'rgba(0,0,0,.18)');
        ctx.fillStyle=sh; ctx.fillRect(x+j/2,y+j/2,bw-j,bh-j);
        for(var n=0;n<6;n++){ctx.fillStyle='rgba('+(r()>.5?'255,255,255':'0,0,0')+','+(r()*.12)+')';ctx.fillRect(x+r()*bw,y+r()*bh,2,2)}
      }
    }
    if(!dirty){
      // fresh sheen
      var s=ctx.createLinearGradient(0,top,W,H); s.addColorStop(0,'rgba(255,255,255,.12)'); s.addColorStop(.5,'rgba(255,255,255,0)'); s.addColorStop(1,'rgba(255,255,255,.08)');
      ctx.fillStyle=s; ctx.fillRect(0,top,W,H-top); return;
    }
    var d=rng(7);
    // overall grime
    ctx.fillStyle='rgba(55,50,30,.42)'; ctx.fillRect(0,top,W,H-top);
    // algae / green patches
    for(var p=0;p<26;p++){
      var px=d()*W, py=top+d()*(H-top), pr=30+d()*110;
      var rg=ctx.createRadialGradient(px,py,0,px,py,pr);
      var green=d()>.4; rg.addColorStop(0,green?'rgba(60,85,25,.55)':'rgba(25,22,15,.5)'); rg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=rg; ctx.fillRect(px-pr,py-pr,pr*2,pr*2);
    }
    // moss in joints
    ctx.lineCap='round';
    blocks.forEach(function(b){
      if(d()<.75){ctx.strokeStyle='rgba('+(40+d()*30|0)+','+(70+d()*40|0)+',22,'+(.55+d()*.4)+')';ctx.lineWidth=(1+d()*2.5)*bw/60;
        ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.lineTo(b[0]+bw*(.3+d()*.7),b[1]);ctx.stroke()}
      if(d()<.5){ctx.lineWidth=(1+d()*2)*bw/60;ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.lineTo(b[0],b[1]+bh);ctx.stroke()}
      // lichen dots
      if(d()<.35){for(var q=0;q<4;q++){ctx.fillStyle='rgba('+(d()>.5?'230,225,200':'20,20,15')+','+(.35+d()*.4)+')';ctx.beginPath();ctx.arc(b[0]+d()*bw,b[1]+d()*bh,1+d()*3,0,6.3);ctx.fill()}}
    });
    // weeds
    for(var w=0;w<(W>600?18:9);w++){
      var b=blocks[Math.floor(d()*blocks.length)], wx=b[0], wy=b[1]+bh*d();
      for(var l=0;l<5;l++){ctx.strokeStyle='rgba(60,100,28,.9)';ctx.lineWidth=1+d()*1.5;ctx.beginPath();ctx.moveTo(wx,wy);ctx.quadraticCurveTo(wx+(d()-.5)*14,wy-8,wx+(d()-.5)*22,wy-10-d()*14);ctx.stroke()}
    }
    // oil stain
    var ox=W*.62, oy=top+(H-top)*.6, orr=Math.min(W,H)*.14;
    var og=ctx.createRadialGradient(ox,oy,0,ox,oy,orr); og.addColorStop(0,'rgba(10,10,10,.6)'); og.addColorStop(.7,'rgba(10,10,10,.3)'); og.addColorStop(1,'rgba(10,10,10,0)');
    ctx.fillStyle=og; ctx.beginPath(); ctx.ellipse(ox,oy,orr*1.4,orr,0.3,0,6.3); ctx.fill();
  }
  function setX(v){ba.style.setProperty('--x',v+'%'); range.value=v;
    ba.querySelector('.ba-tag.b').style.opacity=v<12?0:1; ba.querySelector('.ba-tag.a').style.opacity=v>88?0:1}
  var anim=null;
  function sweep(){
    if(reduce){setX(50);return}
    var start=null, dur=3200; ba.classList.add('washing');
    function step(t){
      if(!start)start=t; var k=Math.min((t-start)/dur,1);
      // 100 -> 0 (wash everything) then back to 50
      var v = k<.7 ? 100-100*easeInOut(k/.7) : 50*easeInOut((k-.7)/.3);
      setX(v);
      if(k<1)anim=requestAnimationFrame(step); else {ba.classList.remove('washing');anim=null}
    }
    anim=requestAnimationFrame(step);
  }
  function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function stopAnim(){if(anim){cancelAnimationFrame(anim);anim=null;ba.classList.remove('washing')}}
  range.addEventListener('input',function(){stopAnim();setX(+range.value);ba.classList.add('washing')});
  range.addEventListener('change',function(){ba.classList.remove('washing')});
  range.addEventListener('pointerup',function(){ba.classList.remove('washing')});
  paint(); setX(100);
  var rt; window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(paint,150)});
  if('IntersectionObserver' in window){
    var bo=new IntersectionObserver(function(en){if(en[0].isIntersecting){bo.disconnect();setTimeout(sweep,400)}},{threshold:.8});
    bo.observe(ba);
  } else setX(50);

  }

  document.getElementById('yr').textContent=new Date().getFullYear();
})();
