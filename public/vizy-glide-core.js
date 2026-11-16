/* Deterministic gliding physics and continuously joined graph terrain. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.VizyGlideCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const TAU=Math.PI*2;
  const ZONE=600;
  const JOIN=48;
  const FAMILIES=[
    {amplitude:12,wavelength:83},
    {amplitude:36,wavelength:53},
    {amplitude:25,wavelength:144},
    {amplitude:24,wavelength:72}
  ];
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  function shape(seed,x,zone){
    const z=Math.max(0,zone);
    const family=FAMILIES[z%FAMILIES.length];
    const cycle=Math.floor(z/FAMILIES.length);
    const height=family.amplitude*(1+cycle*0.13);
    const width=family.wavelength*(1+cycle*0.1);
    const phase=((seed%997)+997)%997*0.002;
    return 210+height*Math.sin((x/width+phase)*TAU)
      +height*0.32*Math.sin((x/(width*2.1)+phase*0.7)*TAU);
  }
  function terrain(seed,x){
    const distance=Number.isFinite(x)?x:0;
    if(distance<0)return shape(seed,distance,0);
    const zone=Math.floor(distance/ZONE);
    const boundary=Math.round(distance/ZONE)*ZONE;
    if(boundary>=ZONE&&Math.abs(distance-boundary)<JOIN){
      const next=Math.round(boundary/ZONE);
      const fraction=(distance-(boundary-JOIN))/(JOIN*2);
      const blend=fraction*fraction*(3-2*fraction);
      return shape(seed,distance,next-1)*(1-blend)+shape(seed,distance,next)*blend;
    }
    return shape(seed,distance,zone);
  }
  function init(seed=7351){
    const safeSeed=Number.isFinite(seed)?seed:7351;
    return{seed:safeSeed,x:0,y:terrain(safeSeed,0),speed:13,vy:0,stars:0,zone:0,airborne:false,lastStar:-1};
  }
  function advance(s,input,dt){
    const t=clamp(Number.isFinite(dt)?dt:0,0,0.05);
    if(t===0)return s;
    const held=Boolean(input&&input.hold);
    const slope=terrain(s.seed,s.x+0.5)-terrain(s.seed,s.x-0.5);
    const downhill=Math.max(0,slope);
    if(!s.airborne){
      s.speed=clamp(s.speed+((held?7:2)*downhill-1.6)*t,6,65);
      s.x+=s.speed*t;
      s.y=terrain(s.seed,s.x);
      if(!held&&slope< -0.12&&s.speed>13){
        s.airborne=true;
        s.vy=slope*s.speed*0.65-10;
      }
    }else{
      s.x+=s.speed*t;
      s.vy+=(held?100:55)*t;
      s.y+=s.vy*t;
      const ground=terrain(s.seed,s.x);
      if(s.y>=ground){s.y=ground;s.vy=0;s.airborne=false;}
      s.speed=clamp(s.speed+(held?0.6:-0.35)*t,6,65);
    }
    s.zone=Math.floor(s.x/ZONE);
    const starIndex=Math.floor(s.x/65);
    if(starIndex>s.lastStar&&Math.abs(s.y-(terrain(s.seed,starIndex*65)-(starIndex%3===0?35:5)))<45){
      s.stars+=1;
      s.lastStar=starIndex;
    }
    if(!['x','y','speed','vy'].every(k=>Number.isFinite(s[k])))return init(s.seed);
    return s;
  }
  function step(state,input,dt){return advance({...state},input,dt);}
  return{terrain,init,step,advance};
});
