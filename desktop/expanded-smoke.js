(async()=>{
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  // This runs only in the app's isolated temporary smoke-test profile.
  career.data.wallet=2000;career.save();showShop();
  for(const id of ['freddy','bonnie','chica','foxy','clock','battery','motor','reserve']){
    const button=document.querySelector('[data-buy="'+id+'"]');
    check(button&&!button.disabled,'Shop purchase unavailable: '+id);button.click();
  }
  for(const id of ['freddy','bonnie','chica','foxy'])document.querySelector('[data-equip="'+id+'"]').click();
  check(career.data.equipped.length===4,'Not all toys can be placed on the desk');
  check(career.data.wallet===550,'Shop charged the wrong amount');
  check(career.data.clockEnabled===false,'Clock must be off until enabled');
  document.getElementById('shopClock').click();
  check(new Career(localStorage).data.clockEnabled,'Clock setting did not persist');
  check(career.effects().freddy&&career.effects().motor,'Installed perks missing');
  await startNight(1,[0,0,0,0]);await new Promise(resolve=>setTimeout(resolve,2200));
  check(engine.duration===540,'Expanded shift duration is incorrect');
  check(engine.maxPower===115,'Battery upgrade missing');
  engine.elapsed=90;updateHUD();
  check(/^\d+°C/.test(document.getElementById('temperature').textContent),'Temperature is not displayed as an integer');
  check(document.getElementById('time').textContent.includes('1:00'),'Precise clock does not show minutes');
  document.getElementById('clockSwitch').click();
  check(!document.getElementById('time').textContent.includes(':'),'Clock did not hide minutes');
  document.getElementById('clockSwitch').click();
  check(document.querySelectorAll('#usage i').length===1,'Fan should be the single initial usage bar');
  check(Sound.ambientSource,'Fan office loop is not running');
  const startTemp=engine.temperature;
  document.getElementById('fanTarget').click();
  check(!engine.fanOn,'Clicking fan did not turn it off');
  check(Sound.ambientSource===null,'Original fan loop is still playing after switch-off');
  check(document.querySelectorAll('#usage i').length===0,'Fan-off should leave no device usage bars');
  for(let i=0;i<480;i++)engine.tick(.25);
  processEvents();updateHUD();
  check(engine.temperature>40&&engine.disorientation>0,'Overheating did not cause disorientation');
  check(Number(document.documentElement.style.getPropertyValue('--heat'))>0,'Heat effect missing');
  document.getElementById('fanSwitch').click();check(engine.fanOn,'Fan could not restart');
  check(Sound.ambientSource,'Fan sound did not restart');
  check(document.querySelectorAll('#usage i').length===1,'Fan restart should restore one bar');
  engine.power=70;updateHUD();document.getElementById('reserveButton').click();
  check(engine.reserveUsed&&career.data.reserve===0&&engine.power>=89,'Reserve charge failed');
  engine.elapsed=539.9;engine.tick(.2);processEvents();updateHUD();
  check(view==='won'&&document.getElementById('earnedShop'),'Victory payment/shop screen missing');
  const wallet=career.data.wallet;check(wallet>550,'No salary was paid');
  win();check(career.data.wallet===wallet,'Duplicate victory paid twice');
  document.getElementById('earnedShop').click();
  check(document.querySelectorAll('.shop-item').length===8,'Shop catalog incomplete');
  check(new Career(localStorage).data.wallet===career.data.wallet,'Wallet did not persist');
  // Render all Endo states in the isolated test profile, using the shipped texture.
  check(assets['Textures/CustomNight/endo.png']?.naturalWidth>0,'Endo texture missing');
  engine=new NightEngine(1);view='playing';engine.monitor=true;engine.cam=9;render(clock);
  check(engine.inCamera(9).some(e=>e.name==='Endo'),'Night-one Endo missing from Backstage');
  engine.enemies[4].pos=1;render(clock);
  for(const [pos,cam] of [[1,3],[2,5],[3,6]]){engine.enemies[4].pos=pos;engine.cam=cam;render(clock);}
  engine.monitor=false;engine.lights[0]=true;engine.enemies[4].pos=4;render(clock);
  jumpEnemy='Endo';jumpStart=clock;view='jump';render(clock+.3);
  check(Number.isFinite(engine.reactionGrace(4)),'Invalid Endo reaction window');
  view='playing';engine=new NightEngine(1,[5,0,0,0,5],()=>1);engine.elapsed=80;engine.monitor=true;engine.cam=9;engine.enemies[0].pos=2;engine.tick(.1);engine.tick(.25);
  check(engine.endoClash&&assets['Textures/CustomNight/endo-punch.png']?.naturalWidth>0,'Endo punch animation missing');render(clock);processEvents();
  for(let i=0;i<5;i++)engine.tick(.25);
  check(engine.enemies[0].pos===1,'Endo did not push Bonnie back');
  customMenu();check(document.getElementById('ai4'),'Endo AI control missing');
  const beforeDemo=JSON.stringify(career.data);
  await showEndoDemo();await new Promise(resolve=>setTimeout(resolve,400));
  check(view==='demo'&&engine.endoClash,'Endo demo did not show the real encounter');
  check(!document.getElementById('demoExit').hidden,'Demo exit missing');
  check(JSON.stringify(career.data)===beforeDemo,'Demo changed career progress or money');
  document.getElementById('demoExit').click();check(view==='menu','Demo exit did not return to menu');
  return{shopItems:8,roundSeconds:540,clockMinutes:true,fanHeat:true,perks:true,payment:true,persistence:true};
})()
