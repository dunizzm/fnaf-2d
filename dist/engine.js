/* Deterministic simulation, independent of rendering and wall-clock time. */
class NightEngine {
 constructor(night=1,custom=null,random=Math.random,loadout={}){this.night=night;this.custom=custom;this.random=random;this.duration=540;this.elapsed=0;this.loadout={...loadout};this.maxPower=loadout.battery?115:100;this.power=this.maxPower;this.fanOn=true;this.temperature=22;this.maxTemperature=22;this.fanPhase=0;this.reserveUsed=false;this.heatWarning=0;this.doors=[false,false];this.lights=[false,false];this.monitor=false;this.cam=0;this.state='playing';this.blackout=0;this.musicStarted=false;this.foxCharge=0;this.foxRun=0;this.aiClock=0;this.events=[];this.history=[];this.enemies=[{name:'Bonnie',type:'rabbit',path:[0,1,9,5,6],pos:0,side:0,wait:0},{name:'Chica',type:'bird',path:[0,1,4,10,7,8],pos:0,side:1,wait:0},{name:'Freddy',type:'bear',path:[0,1,4,7,8],pos:0,side:1,wait:0},{name:'Foxy',type:'fox',path:[2],pos:0,side:0,wait:0}];this.enemies.forEach((e,i)=>{e.moveClock=(7+i*1.7+this.random()*2)*1.5;e.blockedFor=0;});}
 emit(type,data){this.events.push({type,data});this.history.push({time:Math.round(this.elapsed*10)/10,type,data});if(this.history.length>120)this.history.shift();} drain(){const e=this.events;this.events=[];return e;}
 get usage(){return 1+(this.fanOn&&this.power>0?1:0)+this.doors.filter(Boolean).length+this.lights.filter(Boolean).length+(this.monitor?1:0);}
 get clockMinutes(){return Math.min(360,Math.floor(this.elapsed/this.duration*360));}
 get hour(){return Math.min(6,Math.floor(this.elapsed/(this.duration/6)));}
 level(i){if(this.custom)return this.custom[i];const base=[[3,2,0,0],[5,3,1,1],[7,5,2,3],[10,7,4,5],[13,11,7,8]][this.night-1][i];return base===0?0:base+this.hour*.15;}
 toggleDoor(side){if(this.state!=='playing'||this.monitor||this.power<=0)return;this.doors[side]=!this.doors[side];this.emit('door',side);}
 toggleLight(side){if(this.state!=='playing'||this.monitor||this.power<=0)return;this.lights[side]=!this.lights[side];this.emit('light',side);}
 toggleMonitor(){if(this.state!=='playing'||this.power<=0)return;this.monitor=!this.monitor;this.lights=[false,false];this.emit('monitor',this.monitor);}
 selectCamera(id){if(Number.isInteger(id)&&id>=0&&id<11&&this.monitor){this.cam=id;this.emit('camera',id);}}
 toggleFan(){if(this.state!=='playing'||this.power<=0||this.monitor)return false;this.fanOn=!this.fanOn;this.emit('fan',this.fanOn);return true;}
 useReserve(){if(this.state!=='playing'||this.reserveUsed||this.power>=this.maxPower)return false;this.reserveUsed=true;this.power=Math.min(this.maxPower,this.power+20);this.blackout=0;this.musicStarted=false;this.emit('restored');return true;}
 blackoutNow(){this.power=0;this.doors=[false,false];this.lights=[false,false];this.monitor=false;this.emit('blackout');}
 lose(enemy){if(this.state!=='playing')return;this.state='lost';this.killer=enemy;this.emit('lost',enemy);}
 tick(dt){if(this.state!=='playing'||dt<=0)return;dt=Math.min(dt,.25);this.elapsed+=dt;
 const warm=(.052+this.doors.filter(Boolean).length*.006+(this.monitor?.004:0))*(this.loadout.chica?.7:1);const cooling=this.fanOn&&this.power>0?.083*(this.loadout.chica?1.2:1):0;this.temperature=Math.max(21,Math.min(43,this.temperature+(warm-cooling)*dt));this.maxTemperature=Math.max(this.maxTemperature,this.temperature);if(this.fanOn&&this.power>0)this.fanPhase+=dt*13;const tier=this.temperature>=40?3:this.temperature>=35?2:this.temperature>=30?1:0;if(tier>this.heatWarning)this.emit('heat',tier);this.heatWarning=tier;
 if(this.elapsed>=this.duration){this.state='won';this.emit('won',this.night);return;}
 if(this.power<=0){this.blackout+=dt;if(this.blackout>=3&&!this.musicStarted){this.musicStarted=true;this.emit('musicbox');}if(this.blackout>23+this.night*.8)this.lose('Freddy');return;}
 this.power=Math.max(0,this.power-dt*(.0766666667+(this.doors.filter(Boolean).length+this.lights.filter(Boolean).length+(this.monitor?1:0))*.06+(this.fanOn?.014*(this.loadout.motor?.5:1):0))*(this.loadout.freddy?.9:1));
 if(this.power<=0){this.blackoutNow();return;}
 for(let i=0;i<3;i++){const e=this.enemies[i];if(e.pos>=e.path.length){e.wait+=dt;if(this.doors[e.side]){e.blockedFor+=dt;if(e.blockedFor>=2.8){e.pos=1;e.wait=0;e.blockedFor=0;e.moveClock=(12+i)*1.5;this.emit('retreat',e.side);}}else{e.blockedFor=0;const grace=Math.max(2,8-this.level(i)*.3)+(i===0&&this.loadout.bonnie?2:0)-Math.max(0,this.temperature-35)*.06;if(e.wait>grace){this.lose(e.name);return;}}}}
 const foxLevel=this.level(3);if(foxLevel>0&&(this.custom||this.elapsed>60)){if(this.monitor&&this.cam===2&&this.foxRun<=0)this.foxCharge=Math.max(0,this.foxCharge-dt*3);else this.foxCharge+=dt*(.12+foxLevel*.055)*(2/3)*(this.loadout.foxy?.7:1);if(this.foxCharge>=42&&this.foxRun===0){this.foxRun=.01;this.emit('run');}if(this.foxRun>0){this.foxRun+=dt;if(this.foxRun>Math.max(3,7-foxLevel*.2)+(this.loadout.foxy?1:0)){if(this.doors[0]){const cost=3+Math.floor(foxLevel/5);this.power=Math.max(0,this.power-cost);this.emit('bang',cost);this.foxCharge=0;this.foxRun=0;if(this.power<=0)this.blackoutNow();}else{this.lose('Foxy');return;}}}}
 for(let i=0;i<3;i++){const e=this.enemies[i];if(e.pos>=e.path.length||this.elapsed<(this.custom?45:this.night===1?(i===0?112:172):45+(3-i)*9))continue;e.moveClock-=dt;if(e.moveClock>0)continue;e.moveClock=(6+i*.7+this.random()*2.5)*1.5;if(this.monitor&&this.cam===e.path[e.pos])continue;if(i===2&&this.monitor)continue;const chance=Math.pow(Math.min(20,this.level(i))/20,1.35);if(this.random()<chance){e.pos++;e.wait=0;e.blockedFor=0;this.emit('step',{side:e.side,name:e.name,progress:e.pos/e.path.length});if(e.pos>=e.path.length)this.emit('arrival',{side:e.side,name:e.name});}}

 }
 atDoor(side){return this.enemies.find(e=>e.side===side&&e.pos>=e.path.length);}
 inCamera(id){return this.enemies.slice(0,3).filter(e=>e.path[e.pos]===id);}
}
if(typeof module!=='undefined')module.exports=NightEngine;
