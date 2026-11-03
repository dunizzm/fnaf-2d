(async()=>{
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  // This runs only in the app's isolated temporary smoke-test profile.
  check(!career.customUnlocked&&document.getElementById('custom').disabled,'Custom Night must start locked');
  await startNight(1,[0,0,0,0]);check(engine===null,'Locked custom night could be started');
  career.data.completed=6;career.data.night=6;completed=6;saved=6;career.data.wallet=2000;career.save();updateCareerUI();showShop();
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
  // Completing night six unlocks Custom Night through the actual victory flow.
  goMenu();career.data.completed=5;career.data.night=6;completed=5;saved=6;persist();
  check(!career.customUnlocked&&document.getElementById('custom').disabled,'Five nights must not unlock Custom Night');
  engine=new NightEngine(6);customLevels=null;expandedRoundId='smoke-sixth-night';lastSettlement=null;view='playing';engine.elapsed=539.9;engine.tick(.2);processEvents();
  check(completed===6&&career.customUnlocked&&!document.getElementById('custom').disabled,'Sixth-night victory did not unlock Custom Night');
  check(new Career(localStorage).data.completed===6,'Sixth-night completion did not persist');
  goMenu();showExtras();check(document.querySelectorAll('[data-preview]').length===5,'Extras gallery is incomplete');
  check(assets['PhantomBB-atlas.webp']?.naturalWidth===3744,'Original Phantom animation atlas missing');
  check(assets['Textures/CustomNight/phantom-bb.png']?.naturalWidth>0,'Phantom BB texture missing');
  customMenu();check(document.getElementById('ai4')&&!document.getElementById('ai5'),'Phantom AI control missing or removed Endo remains');
  const beforeDemo=JSON.stringify(career.data);
  await showPhantomDemo();
  // Hidden desktop windows may throttle animation frames; advance the fixture deterministically.
  engine.tick(.1);processEvents();
  check(view==='demo'&&engine.phantom.active,'Phantom demo did not show the camera encounter');render(clock);
  engine.tick(.25);for(let i=0;i<4;i++)engine.tick(.25);processEvents();render(clock);
  check(engine.phantom.scare>0&&engine.state==='playing'&&!engine.fanOn&&engine.fanFault>0,'Nonlethal Phantom scare or fan failure missing');
  check(!document.getElementById('demoExit').hidden,'Demo exit missing');
  check(JSON.stringify(career.data)===beforeDemo,'Demo changed career progress or money');
  document.getElementById('demoExit').click();check(view==='menu','Demo exit did not return to menu');
  return{shopItems:8,roundSeconds:540,clockMinutes:true,fanHeat:true,perks:true,payment:true,persistence:true};
})()
