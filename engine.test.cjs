const assert=require('node:assert/strict');const Engine=require('./dist/engine.js');
function run(e,seconds){for(let t=0;t<seconds;t+=.1)e.tick(.1);return e;}
// An empty custom night must finish at 6 AM with energy remaining.
let e=new Engine(5,[0,0,0,0],()=>0);run(e,361);assert.equal(e.state,'won');assert.equal(e.hour,6);assert(e.power>54);
// Maximum consumption causes a blackout and releases every powered device.
e=new Engine(1,[0,0,0,0],()=>1);e.doors=[true,true];e.lights=[true,true];e.monitor=true;run(e,180);assert.equal(e.power,0);assert.deepEqual(e.doors,[false,false]);assert.deepEqual(e.lights,[false,false]);assert.equal(e.monitor,false);assert.equal(e.drain().filter(x=>x.type==='blackout').length,1);run(e,30);assert.equal(e.state,'lost');
// A door blocks a real attack, then the visitor retreats; an open door loses.
for(const blocked of [true,false]){e=new Engine(1,[0,0,0,0],()=>0);const b=e.enemies[0];b.pos=b.path.length;e.doors[0]=blocked;run(e,9);assert.equal(e.state,blocked?'playing':'lost');if(blocked)assert.equal(b.pos,1);}
// Camera observation suppresses a movement opportunity for the watched enemy.
e=new Engine(5,[20,0,0,0],()=>0);e.elapsed=40;e.monitor=true;e.cam=0;run(e,8);assert.equal(e.enemies[0].pos,0);e.monitor=false;run(e,8);assert.equal(e.enemies[0].pos,1);
// Foxy's rush can be blocked, costing power. A final hit can trigger blackout.
for(const blocked of [true,false]){e=new Engine(1,[0,0,0,20],()=>1);e.foxRun=1;e.doors[0]=blocked;run(e,3.5);assert.equal(e.state,blocked?'playing':'lost');if(blocked){assert.equal(e.foxRun,0);assert(e.power<93);}}
e=new Engine(1,[0,0,0,20],()=>1);e.power=5;e.foxRun=3.9;e.doors[0]=true;e.tick(.2);assert.equal(e.power,0);assert.deepEqual(e.doors,[false,false]);assert(e.drain().some(x=>x.type==='blackout'));
// A late blackout still allows the player to reach dawn before Freddy attacks.
e=new Engine(1,[0,0,0,0]);e.elapsed=359;e.blackoutNow();run(e,2);assert.equal(e.state,'won');
// Powered controls are unavailable during a blackout and after the end.
e.toggleDoor(0);assert.equal(e.doors[0],false);const old=e.elapsed;e.tick(.1);assert.equal(e.elapsed,old);
console.log('PASS: dawn, energy, blackout, blocked and open doors, camera observation, Foxy, end-state controls.');

// Two concurrent visitors must both be blocked without opening powered doors.
e=new Engine(5,[5,5,5,5],()=>1);for(let i=0;i<2;i++)e.enemies[i].pos=e.enemies[i].path.length;e.doors=[true,true];run(e,10);assert.equal(e.state,'playing');assert.deepEqual(e.doors,[true,true]);assert(e.power>95);
// Music starts once after a blackout, then the attack comes after the tune.
e=new Engine(1,[0,0,0,0]);e.blackoutNow();e.drain();run(e,4);assert.equal(e.state,'playing');assert.equal(e.drain().filter(x=>x.type==='musicbox').length,1);run(e,2);assert(!e.drain().some(x=>x.type==='musicbox'));
console.log('PASS: simultaneous blocked visitors and blackout music timing.');
