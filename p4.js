let pf=[],fa=0;
const RLT={basic:2,our:3.5,stal:5};
function ip(s){if(s.pmax!==undefined)return;s.pmax=12*MUL[s.r];s.ph=s.pmax;s.rl=0;s.rlm=1;s.sc=0;s.da=0;s.dr=0;s.fl=0;s.nw=1}
function loop(now){
  const dt=Math.min(0.05,(now-(loop.l||now))/1000);loop.l=now;t+=dt;zoneT-=dt;
  for(const q of toasts)q.t-=dt;
  toasts=toasts.filter(q=>q.t>0);
  for(const q of pf)q.t-=dt;
  pf=pf.filter(q=>q.t>0);
  const G=geo(),ps=[...ptrs.values()];
  const atk=!!(mouseB&1)||!!keys.Space||ps.some(q=>q.ty==='atk');
  const def=!atk&&(!!(mouseB&2)||!!keys.ShiftLeft||!!keys.ShiftRight||ps.some(q=>q.ty==='def'));
  let vx=0,vy=0;
  const jp=ps.find(q=>q.ty==='joy');
  if(jp){
    const dx=jp.x-G.joy.x,dy=jp.y-G.joy.y,l=Math.hypot(dx,dy);
    if(l>6){const k=Math.min(1,l/G.joy.r);vx=dx/l*k;vy=dy/l*k}
  }
  if(keys.KeyW||keys.ArrowUp)vy-=1;
  if(keys.KeyS||keys.ArrowDown)vy+=1;
  if(keys.KeyA||keys.ArrowLeft)vx-=1;
  if(keys.KeyD||keys.ArrowRight)vx+=1;
  if(!jp&&!vx&&!vy&&FINE&&mouseSeen){
    const dx=mx-c.width/2,dy=my-c.height/2,l=Math.hypot(dx,dy);
    if(l>12){vx=dx/l;vy=dy/l}
  }
  const vl=Math.hypot(vx,vy);
  if(vl>1){vx/=vl;vy/=vl}
  if(vl>.1){const d=Math.atan2(vy,vx)-fa;fa+=Math.atan2(Math.sin(d),Math.cos(d))*Math.min(1,dt*10)}
  p.inv=Math.max(0,(p.inv||0)-dt);p.kx=p.kx||0;p.ky=p.ky||0;
  p.x+=(vx*220+p.kx)*dt;p.y+=(vy*220+p.ky)*dt;
  const kd=Math.max(0,1-dt*7);p.kx*=kd;p.ky*=kd;
  p.x=Math.max(0,Math.min(M.w,p.x));p.y=Math.max(0,Math.min(M.h,p.y));
  for(const q of M.portals){
    if(near(q.x,q.y,q.w,q.h,p.x,p.y,10)){loadMap(q.to,q.tx,q.ty);break}
  }
  const safe=inSafe(p,0);
  p.hp=Math.min(p.max,p.hp+(safe?15:2)*dt);
  spawnT-=dt;
  if(spawnT<=0&&mobs.length<M.maxMobs){
    spawnT=1.2;
    for(let k=0;k<6;k++){
      const a=Math.random()*6.28,r=450+Math.random()*350;
      const sx=Math.max(20,Math.min(M.w-20,p.x+Math.cos(a)*r)),sy=Math.max(20,Math.min(M.h-20,p.y+Math.sin(a)*r));
      if(inSafe({x:sx,y:sy},120))continue;
      let onP=false;
      for(const q of M.portals)if(near(q.x,q.y,q.w,q.h,sx,sy,80))onP=true;
      if(onP)continue;
      mobs.push({x:sx,y:sy,hp:M.mobHp,max:M.mobHp,r:16,inv:0,kx:0,ky:0,ca:0});break;
    }
  }
  const kd2=Math.max(0,1-dt*6);
  for(const m of mobs){
    m.inv-=dt;m.ca=(m.ca||0)-dt;m.kx=m.kx||0;m.ky=m.ky||0;
    m.x+=m.kx*dt;m.y+=m.ky*dt;m.kx*=kd2;m.ky*=kd2;
    if(!safe&&m.ca<=0&&Math.hypot(p.x-m.x,p.y-m.y)<450){const a=Math.atan2(p.y-m.y,p.x-m.x);m.x+=Math.cos(a)*M.mobSpeed*dt;m.y+=Math.sin(a)*M.mobSpeed*dt}
    const sd=Math.hypot(m.x-M.safe.x,m.y-M.safe.y);
    if(sd<M.safe.r+m.r){const a=Math.atan2(m.y-M.safe.y,m.x-M.safe.x);m.x=M.safe.x+Math.cos(a)*(M.safe.r+m.r);m.y=M.safe.y+Math.sin(a)*(M.safe.r+m.r)}
    m.x=Math.max(0,Math.min(M.w,m.x));m.y=Math.max(0,Math.min(M.h,m.y));
    const d=Math.hypot(p.x-m.x,p.y-m.y);
    if(!safe&&d<m.r+13&&p.inv<=0){
      const nx=(p.x-m.x)/(d||1),ny=(p.y-m.y)/(d||1);
      p.hp-=M.mobDmg*1.2;p.inv=.6;p.kx=nx*420;p.ky=ny*420;
      m.kx=-nx*260;m.ky=-ny*260;m.ca=.35;
    }
  }
  const RT=atk?95:def?28:55;
  R+=(RT-R)*Math.min(1,dt*10);
  const act=prim.filter(Boolean);
  act.forEach((s,i)=>{
    ip(s);
    if(s.rl>0){s.rl-=dt;if(s.rl<=0){s.rl=0;s.ph=s.pmax;if(s.t==='stal')s.life=6}}
    else if(s.t==='stal'){s.life-=dt;if(s.life<=0){s.rl=12;s.rlm=12}}
    s.broke=s.rl;
    s.fl=Math.max(0,s.fl-dt);
    const ta=t*2+i*Math.PI*2/act.length;
    if(s.nw){s.da=ta;s.dr=0;s.nw=0}
    let dd=ta-s.da;dd=Math.atan2(Math.sin(dd),Math.cos(dd));
    s.da+=dd*Math.min(1,dt*14);
    s.dr+=(R-s.dr)*Math.min(1,dt*9);
    s.sc+=((s.rl>0?0:1)-s.sc)*Math.min(1,dt*(s.rl>0?20:7));
    s.x=p.x+Math.cos(s.da)*s.dr;s.y=p.y+Math.sin(s.da)*s.dr;
    if(s.rl>0||s.sc<.5)return;
    const dmg=TYPES[s.t].dmg*MUL[s.r];
    const pr=(9+s.r*1.2+(s.t==='our'||s.t==='stal'?2:0))*s.sc;
    for(const m of mobs){
      if(m.inv>0)continue;
      if(Math.hypot(s.x-m.x,s.y-m.y)<m.r+pr){
        m.hp-=dmg;m.inv=.25;s.fl=.12;
        const ex=m.x-s.x,ey=m.y-s.y,l=Math.hypot(ex,ey)||1;
        m.kx=ex/l*170;m.ky=ey/l*170;
        if(s.t!=='stal'){s.ph-=M.mobDmg*.6;if(s.ph<=0){s.ph=0;s.rl=RLT[s.t];s.rlm=RLT[s.t]}}
        if(s.t==='our'&&allies.length<CAPS[s.r]){
          const a2=Math.random()*6.28,r2=60+Math.random()*50;
          allies.push({x:p.x+Math.cos(a2)*r2,y:p.y+Math.sin(a2)*r2,hp:30*MUL[s.r],max:30*MUL[s.r],r:8+s.r,rar:s.r,cd:0});
        }
      }
    }
  });
  for(const s of allies){
    s.cd-=dt;
    const m=nearest(s,mobs);
    const tg=m&&Math.hypot(m.x-s.x,m.y-s.y)<600?m:p;
    const a=Math.atan2(tg.y-s.y,tg.x-s.x);
    if(Math.hypot(tg.x-s.x,tg.y-s.y)>25){s.x+=Math.cos(a)*200*dt;s.y+=Math.sin(a)*200*dt}
    for(const mm of mobs){
      if(Math.hypot(mm.x-s.x,mm.y-s.y)<mm.r+s.r){
        s.hp-=15*dt;
        if(s.cd<=0){mm.hp-=15*MUL[s.rar];s.cd=.5}
      }
    }
  }
  allies=allies.filter(s=>s.hp>0);
  const alive=[];
  for(const m of mobs){if(m.hp>0)alive.push(m);else{kills++;drop();pf.push({x:m.x,y:m.y,t:.35})}}
  mobs=alive;
  if(p.hp<=0){respawn();p.kx=0;p.ky=0;p.inv=1}
  draw(atk,def,jp,G);requestAnimationFrame(loop);
}
const _draw=draw;
draw=function(atk,def,jp,G){
  const sv=[];
  if(!invOpen)for(const s of prim)if(s){ip(s);sv.push([s,s.x,s.y]);s.x=-1e6;s.y=-1e6}
  _draw(atk,def,jp,G);
  for(const q of sv){q[0].x=q[1];q[0].y=q[2]}
  if(invOpen)return;
  const X=c.width/2,Y=c.height/2;
  for(const q of pf){
    const f=1-q.t/.35;
    x.globalAlpha=1-f;x.strokeStyle='#fc0';x.lineWidth=3;
    x.beginPath();x.arc(X+q.x-p.x,Y+q.y-p.y,10+f*26,0,6.28);x.stroke();
  }
  x.globalAlpha=1;
  const flash=p.inv>0&&Math.floor(t*20)%2;
  x.fillStyle=flash?'#ff9a9a':'#ffe066';x.strokeStyle='#b8962e';x.lineWidth=3;
  x.beginPath();x.arc(X,Y,16,0,6.28);x.fill();x.stroke();
  const blink=(t%4)<.12,ca=Math.cos(fa),sa=Math.sin(fa);
  for(const sd of [-1,1]){
    const ex=X+ca*4+Math.cos(fa+1.5708)*sd*5.5,ey=Y+sa*4+Math.sin(fa+1.5708)*sd*5.5;
    if(blink){x.strokeStyle='#000';x.lineWidth=2;x.beginPath();x.moveTo(ex-3,ey);x.lineTo(ex+3,ey);x.stroke()}
    else{
      x.fillStyle='#fff';x.strokeStyle='#000';x.lineWidth=1.5;
      x.beginPath();x.arc(ex,ey,4.6,0,6.28);x.fill();x.stroke();
      x.fillStyle='#000';x.beginPath();x.arc(ex+ca*1.8,ey+sa*1.8,2.6,0,6.28);x.fill();
    }
    if(atk){x.strokeStyle='#000';x.lineWidth=2;x.beginPath();x.moveTo(ex-4*sd,ey-7);x.lineTo(ex+4*sd,ey-4);x.stroke()}
  }
  for(const s of prim){
    if(!s||s.sc<.03)continue;
    const T=TYPES[s.t],px=X+s.x-p.x,py=Y+s.y-p.y,pr=(9+s.r*1.2+(s.t==='our'||s.t==='stal'?2:0))*s.sc;
    x.globalAlpha=(s.t==='stal'&&s.life<2&&Math.floor(t*10)%2)?.45:1;
    x.fillStyle=s.fl>0?'#fff':T.col;x.strokeStyle=T.st;x.lineWidth=3;
    x.beginPath();x.arc(px,py,pr,0,6.28);x.fill();x.stroke();
    if(s.r>0){x.strokeStyle=RAR[s.r].c;x.lineWidth=2;x.beginPath();x.arc(px,py,pr+3,0,6.28);x.stroke()}
    if(s.t==='our'&&pr>8){x.fillStyle='#fc0';x.font='bold 8px sans-serif';x.textAlign='center';x.fillText('OUR',px,py+3)}
    if(s.ph<s.pmax&&s.rl<=0){x.fillStyle='#000';x.fillRect(px-11,py-pr-8,22,4);x.fillStyle='#6f6';x.fillRect(px-11,py-pr-8,22*s.ph/s.pmax,4)}
    x.globalAlpha=1;
  }
  const s2=Math.min(42,Math.max(30,(c.width-540)/5.4));
  const x0=(c.width-5*(s2+5))/2,yP=c.height-s2-8;
  for(let i=0;i<5;i++){
    const s=prim[i];
    if(s&&s.rl>0){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(x0+i*(s2+5),yP,s2,s2*Math.min(1,s.rl/(s.rlm||1)))}
  }
};
// SON
