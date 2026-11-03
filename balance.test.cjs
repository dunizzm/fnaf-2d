const assert=require('node:assert/strict');const Engine=require('./dist/engine.js');
let won=0,minPower=100,maxClosed=0;
for(let seed=1;seed<=100;seed++){
 let state=seed;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const e=new Engine(5,[5,5,5,5,5],random);let nextCheck=0,heldUntil=[0,0],runUntil=0,closed=0;
 for(let t=0;t<540.2&&e.state==='playing';t+=.1){
  // Look at Pirate Cove for 2 seconds every 20 seconds, and inspect both doors every 3 seconds.
  const watch=t%20<2;e.monitor=watch;e.cam=2;e.lights=[false,false];
  if(t>=nextCheck&&!watch){nextCheck=t+3;e.lights=[true,true];for(let side=0;side<2;side++)if(e.atDoor(side))heldUntil[side]=t+4;}
  for(let side=0;side<2;side++)e.doors[side]=t<heldUntil[side]||(side===0&&t<runUntil);
  if(e.doors.some(Boolean))closed+=.1;e.tick(.1);
  for(const event of e.drain())if(event.type==='run')runUntil=t+8;
 }
 if(e.state==='won')won++;minPower=Math.min(minPower,e.power);maxClosed=Math.max(maxClosed,closed);
}
assert.equal(won,100,'A simple repeatable strategy must survive all 100 seeded 5/20 nights.');assert(maxClosed<150,'Doors must not need to remain closed all night.');
// No Freddy or Foxy activation on night one, even at 5 AM.
const first=new Engine(1);first.elapsed=539;assert.equal(first.level(2),0);assert.equal(first.level(3),0);
console.log(`PASS: 5/20 won ${won}/100 seeds; minimum remaining power ${minPower.toFixed(1)}%; doors closed at most ${maxClosed.toFixed(1)} of 540 seconds.`);
