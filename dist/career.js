'use strict';
const SHOP_ITEMS = Object.freeze([
 {id:'freddy',name:'Фигурка Фредди',type:'toy',price:180,texture:'freddy',description:'Расход всей энергии −10%. Спокойный напарник на долгую смену.'},
 {id:'bonnie',name:'Фигурка Бонни',type:'toy',price:200,texture:'bonnie',description:'Даёт ещё 2 секунды закрыть левую дверь после прихода Бонни.'},
 {id:'chica',name:'Фигурка Чики',type:'toy',price:180,texture:'chica',description:'Комната нагревается на 30% медленнее. Охлаждение быстрее на 20%.'},
 {id:'foxy',name:'Фигурка Фокси',type:'toy',price:220,texture:'foxy',description:'Фокси набирает активность на 30% медленнее. На его бег +1 секунда реакции.'},
 {id:'clock',name:'Точные часы',type:'device',price:90,icon:'clock',description:'Можно включать и выключать. Показывают игровые часы и минуты: 2:37 AM.'},
 {id:'battery',name:'Большой аккумулятор',type:'upgrade',price:280,icon:'battery',description:'Каждая смена начинается со 115% энергии вместо 100%.'},
 {id:'motor',name:'Тихий мотор',type:'upgrade',price:210,icon:'fan',description:'Вентилятор расходует вдвое меньше энергии. Охлаждение сохраняется.'},
 {id:'reserve',name:'Аварийный заряд',type:'consumable',price:90,icon:'charge',description:'+20% энергии по кнопке B. Один заряд за смену, максимум 9 в запасе.'}
]);
class Career {
 constructor(storage=null){this.storage=storage;this.saved=true;let raw={};try{raw=JSON.parse(storage?.getItem('fnaf-expanded-save-v1')||'{}')||{};}catch{}
 const integer=(n,lo,hi,fallback=lo)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,Math.floor(n))):fallback;
 const permanent=new Set(SHOP_ITEMS.filter(i=>i.type!=='consumable').map(i=>i.id));
 const owned=Array.isArray(raw.owned)?[...new Set(raw.owned.filter(x=>permanent.has(x)))]:[];
 this.data={version:1,wallet:integer(raw.wallet,0,10000000),owned,equipped:Array.isArray(raw.equipped)?[...new Set(raw.equipped.filter(x=>owned.includes(x)&&SHOP_ITEMS.some(i=>i.id===x&&i.type==='toy')))]:[],clockEnabled:!!raw.clockEnabled&&owned.includes('clock'),reserve:integer(raw.reserve,0,9),night:integer(raw.night,1,5),completed:integer(raw.completed,0,5),shifts:integer(raw.shifts,0,10000000),earned:integer(raw.earned,0,10000000),settled:Array.isArray(raw.settled)?raw.settled.filter(x=>typeof x==='string').slice(-128):[]};
 }
 save(){try{this.storage?.setItem('fnaf-expanded-save-v1',JSON.stringify(this.data));this.saved=true;}catch{this.saved=false;}return this.saved;}
 item(id){return SHOP_ITEMS.find(i=>i.id===id);}
 owns(id){return this.data.owned.includes(id);}
 buy(id){const item=this.item(id);if(!item)return{ok:false,reason:'Неизвестный предмет.'};if(item.type!=='consumable'&&this.owns(id))return{ok:false,reason:'Уже куплено.'};if(item.type==='consumable'&&this.data.reserve>=9)return{ok:false,reason:'В запасе уже 9 зарядов.'};if(this.data.wallet<item.price)return{ok:false,reason:'Недостаточно монет. Деньги выдаются после смены.'};this.data.wallet-=item.price;if(item.type==='consumable')this.data.reserve++;else this.data.owned.push(id);this.save();return{ok:true};}
 equip(id){if(!this.owns(id)||this.item(id)?.type!=='toy')return{ok:false,reason:'Сначала купите фигурку.'};const index=this.data.equipped.indexOf(id);if(index>=0)this.data.equipped.splice(index,1);else{this.data.equipped.push(id);}this.save();return{ok:true};}
 toggleClock(){if(!this.owns('clock'))return false;this.data.clockEnabled=!this.data.clockEnabled;this.save();return true;}
 effects(){return{freddy:this.data.equipped.includes('freddy'),bonnie:this.data.equipped.includes('bonnie'),chica:this.data.equipped.includes('chica'),foxy:this.data.equipped.includes('foxy'),battery:this.owns('battery'),motor:this.owns('motor')};}
 consumeReserve(){if(this.data.reserve<=0)return false;this.data.reserve--;this.save();return true;}
 settle(engine,id){if(!['won','lost'].includes(engine.state))throw Error('Shift has not ended');if(typeof id!=='string'||!id)throw Error('Missing shift ID');if(this.data.settled.includes(id))return{total:0,duplicate:true};let salary=0,energy=0,comfort=0;if(engine.state==='won'){salary=150+engine.night*15;if(engine.custom)salary=Math.floor(salary*(.25+.75*engine.custom.reduce((a,b)=>a+b,0)/(engine.custom.length*20)));energy=Math.floor(Math.max(0,engine.power)*.5);comfort=engine.maxTemperature<30?20:0;this.data.shifts++;}else salary=Math.min(45,Math.floor(engine.elapsed/60)*8);const total=salary+energy+comfort;this.data.wallet+=total;this.data.earned+=total;this.data.settled.push(id);this.data.settled=this.data.settled.slice(-128);this.save();return{salary,energy,comfort,total,duplicate:false};}
}
if(typeof module!=='undefined')module.exports={Career,SHOP_ITEMS};
