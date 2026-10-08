const KEY='naija_lifestyle_v4';

const districts={
  Wuse:{desc:'A busy district with offices, shops and everyday Abuja life.',travel:0,actions:[
    ['Go to work','Work your scheduled shift if you have a job.',0,'work'],
    ['Eat at a buka','Restore hunger and lose a little cash.',900,'eat'],
    ['Relax at a cafe','Have a drink and unwind.',700,'fun'],
    ['Use public transport','Move around Abuja by bus/keke.',300,'transport'],
    ['Shop for essentials','Buy household essentials.',600,'shop']
  ]},
  Garki:{desc:'Government offices, markets and practical everyday businesses.',travel:350,actions:[
    ['Look for work','Visit a workplace and apply for an available career.',0,'job'],
    ['Work your shift','Work if your current job is based here.',0,'work'],
    ['Eat lunch','A quick local meal.',800,'eat'],
    ['Run an errand','Handle a useful daily task.',250,'errand']
  ]},
  Jabi:{desc:'A social district with the lake, restaurants and leisure spots.',travel:500,actions:[
    ['Visit Jabi Lake','Relax and improve fun and social.',1200,'lake'],
    ['Meet people','Spend time around the social scene.',500,'social'],
    ['Eat at a restaurant','A proper meal.',1800,'eat'],
    ['Shop','Buy something useful.',900,'shop']
  ]},
  Maitama:{desc:'An upscale district with offices, homes and premium services.',travel:700,actions:[
    ['Search for a career','Check higher-paying career opportunities.',0,'job'],
    ['Network','Meet people who can improve your career path.',300,'network'],
    ['Premium meal','Eat well and restore several needs.',2500,'meal'],
    ['View properties','Look at better homes.',0,'property']
  ]},
  Gwarinpa:{desc:'A large residential district with affordable everyday life.',travel:500,actions:[
    ['Rest at home','Recover energy and hygiene at your home.',0,'home'],
    ['Cook a meal','Use groceries to prepare food.',300,'cook'],
    ['Buy groceries','Stock up for future meals.',1200,'grocery'],
    ['Socialise','Visit friends and build relationships.',400,'social']
  ]},
  Asokoro:{desc:'A quiet high-value district close to major government areas.',travel:800,actions:[
    ['Network','Build professional connections.',500,'network'],
    ['Apply for work','Look for a better career.',0,'job'],
    ['Relax','Take time away from work.',600,'fun']
  ]},
  Kubwa:{desc:'A growing district where living costs are lower.',travel:600,actions:[
    ['Search for work','Find practical jobs and side hustles.',0,'job'],
    ['Affordable meal','Eat without spending much.',500,'eat'],
    ['Rest','Recover energy.',0,'rest'],
    ['Shop for groceries','Get basic supplies.',800,'grocery']
  ]},
  'Central Area':{desc:'The heart of Abuja, with offices, services and city activity.',travel:650,actions:[
    ['Government office','Handle official paperwork.',300,'errand'],
    ['Career centre','Search for professional opportunities.',0,'job'],
    ['Business district','Network and look for opportunities.',500,'network'],
    ['Eat','Grab a quick meal.',1000,'eat']
  ]}
};

const jobs=[
 {name:'Retail Assistant',place:'Wuse',salary:22000,shift:[9,17],xp:1,req:0},
 {name:'Office Assistant',place:'Garki',salary:35000,shift:[8,16],xp:2,req:1},
 {name:'Customer Support',place:'Central Area',salary:42000,shift:[9,17],xp:2,req:2},
 {name:'Sales Executive',place:'Maitama',salary:55000,shift:[9,17],xp:3,req:3},
 {name:'Tech Support',place:'Jabi',salary:70000,shift:[10,18],xp:4,req:5}
];

let state={
  started:false,name:'Abujan',day:1,hour:8,minute:0,location:'Wuse',
  cash:5000,bank:0,home:'Wuse Room',career:null,level:1,xp:0,
  needs:{hunger:82,energy:90,fun:65,social:60,hygiene:85,bladder:75},
  inventory:{groceries:2},log:['Day 1 — You arrived in Abuja with ₦5,000 and a place to sleep.']
};

const $=id=>document.getElementById(id);
function money(n){return '₦'+Math.max(0,Math.round(n)).toLocaleString('en-NG')}
function save(){localStorage.setItem(KEY,JSON.stringify(state)); log('Game saved.');}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x)state={...state,...x,needs:{...state.needs,...x.needs},inventory:{...state.inventory,...x.inventory}}}catch(e){}}
function log(s){state.log.unshift(`Day ${state.day} ${String(state.hour).padStart(2,'0')}:${String(state.minute).padStart(2,'0')} — ${s}`);state.log=state.log.slice(0,60);renderLog()}
function advance(min){
  const total=state.hour*60+state.minute+min;
  const oldDay=state.day;
  state.day+=Math.floor(total/1440);
  const t=total%1440; state.hour=Math.floor(t/60); state.minute=t%60;
  if(state.day>oldDay) dailyReset(oldDay,state.day);
  state.needs.hunger=Math.max(0,state.needs.hunger-min*.012);
  state.needs.energy=Math.max(0,state.needs.energy-min*.008);
  state.needs.fun=Math.max(0,state.needs.fun-min*.003);
  state.needs.social=Math.max(0,state.needs.social-min*.002);
  state.needs.hygiene=Math.max(0,state.needs.hygiene-min*.004);
  state.needs.bladder=Math.max(0,state.needs.bladder-min*.006);
}
function dailyReset(){if(state.career){state.bank+=state.career.salary;log(`Your salary of ${money(state.career.salary)} was paid into your bank.`)}}
function canPay(cost){if(state.cash<cost){log(`You need ${money(cost-state.cash)} more cash.`);return false}return true}
function spend(cost){state.cash-=cost}
function effect(obj){for(const [k,v] of Object.entries(obj))state.needs[k]=Math.max(0,Math.min(100,state.needs[k]+v))}
function travel(to){
  if(to===state.location)return;
  const cost=districts[to].travel;
  if(!canPay(cost))return;
  spend(cost);advance(20+Math.round(cost/100));state.location=to;log(`You travelled to ${to} for ${money(cost)}.`);render();
}
function action(type,label,cost){
  if(cost&&!canPay(cost))return;
  if(cost)spend(cost);
  switch(type){
    case'eat':effect({hunger:38,energy:3});advance(25);log(`You ate. Hunger improved.`);break;
    case'meal':effect({hunger:55,energy:8,fun:8});advance(35);log(`You had a premium meal.`);break;
    case'lake':effect({fun:35,social:15,energy:-5});advance(90);log(`You spent time at Jabi Lake.`);break;
    case'social':effect({social:30,fun:15,energy:-8});advance(70);log(`You socialised and met people.`);break;
    case'fun':effect({fun:28,energy:-5});advance(60);log(`You relaxed.`);break;
    case'home':effect({energy:35,hygiene:25,fun:8,bladder:20});advance(120);log(`You rested at home.`);break;
    case'rest':effect({energy:28});advance(90);log(`You rested.`);break;
    case'work':work();return;
    case'job':showJobs();return;
    case'network':effect({social:15,fun:8});advance(60);state.xp+=1;log(`You networked and gained career experience.`);levelUp();break;
    case'transport':effect({energy:-2});advance(25);log(`You used local transport for an errand.`);break;
    case'shop':state.inventory.groceries=(state.inventory.groceries||0)+1;advance(25);log(`You bought an item for later.`);break;
    case'grocery':state.inventory.groceries=(state.inventory.groceries||0)+3;advance(30);log(`You bought groceries.`);break;
    case'cook':if(!state.inventory.groceries){log('You have no groceries.');return}state.inventory.groceries--;effect({hunger:48,energy:5});advance(40);log(`You cooked a meal at home.`);break;
    case'errand':advance(45);effect({bladder:-5,energy:-4});log(`You handled an errand.`);break;
    case'property':log('Property system foundation: better homes will unlock as your career and savings grow.');break;
  }
  levelUp();render();
}
function work(){
  if(!state.career){log('You do not have a job yet. Visit a career location and apply.');return}
  const [start,end]=state.career.shift;
  if(state.location!==state.career.place){log(`Your job is in ${state.career.place}. Travel there first.`);return}
  if(state.hour<start||state.hour>=end){log(`Your shift is ${start}:00–${end}:00. Come back during work hours.`);return}
  const mins=Math.min(120,(end-state.hour)*60-state.minute);
  advance(Math.max(30,mins));effect({energy:-25,hunger:-20,hygiene:-10,bladder:-15,fun:-12});state.cash+=Math.round(state.career.salary/4);state.xp+=state.career.xp;
  log(`You worked a shift and earned ${money(Math.round(state.career.salary/4))}.`);levelUp();render();
}
function showJobs(){
  const available=jobs.filter(j=>j.req<=state.level);
  const msg=available.map((j,i)=>`${i+1}. ${j.name} — ${money(j.salary)}/day — ${j.place} — ${j.shift[0]}:00-${j.shift[1]}:00`).join('\\n');
  const pick=prompt(`Available careers:\\n\\n${msg}\\n\\nType the number to apply.`);
  const idx=Number(pick)-1;
  if(available[idx]){
    const j=available[idx];state.career=j;state.xp+=1;log(`You got a job as ${j.name}. Salary: ${money(j.salary)} per day.`);render();
  }
}
function levelUp(){const needed=state.level*5;if(state.xp>=needed){state.level++;log(`Career level increased to ${state.level}.`)}}
function render(){
  $('landing').classList.toggle('hidden',state.started);$('game').classList.toggle('hidden',!state.started);
  $('day').textContent=state.day;$('clock').textContent=`${String(state.hour).padStart(2,'0')}:${String(state.minute).padStart(2,'0')}`;
  $('location').textContent=state.location;$('cash').textContent=money(state.cash);$('bank').textContent=money(state.bank);
  $('playerName').textContent=state.name;$('avatar').textContent=(state.name[0]||'A').toUpperCase();
  $('jobTitle').textContent=state.career?state.career.name:'Unemployed';$('home').textContent=state.home;
  $('career').textContent=state.career?state.career.name:'Unemployed';$('level').textContent=state.level;
  $('landingDay').textContent=`Day ${state.day}`;
  renderNeeds();renderMap();renderActions();renderLog();
}
function renderNeeds(){
 const labels={hunger:'Hunger',energy:'Energy',fun:'Fun',social:'Social',hygiene:'Hygiene',bladder:'Bladder'};
 $('needs').innerHTML=Object.entries(state.needs).map(([k,v])=>`<div class="need"><div class="need-top"><span>${labels[k]}</span><b>${Math.round(v)}</b></div><div class="bar"><div class="fill" style="width:${v}%"></div></div></div>`).join('');
}
function renderMap(){
 $('map').innerHTML=Object.keys(districts).map(d=>`<button class="district ${d===state.location?'active':''}" onclick="travel('${d.replace(/'/g,"\\'")}')"><b>${d}</b><small>${d===state.location?'You are here':'Travel '+money(districts[d].travel)}</small></button>`).join('');
 const p=districts[state.location];$('placeTitle').textContent=state.location;$('placeDesc').textContent=p.desc;
}
function renderActions(){
 const p=districts[state.location];
 $('actions').innerHTML=p.actions.map(a=>`<button class="action" onclick="action('${a[3]}','${a[0].replace(/'/g,"\\'")}',${a[2]})"><b>${a[0]}</b><small>${a[1]}</small>${a[2]?`<small class="cost">${money(a[2])}</small>`:''}</button>`).join('');
 $('travelHint').textContent=`${state.inventory.groceries||0} groceries`;
}
function renderLog(){$('log').innerHTML=state.log.map(x=>`<div>${x}</div>`).join('')}
$('startBtn').onclick=()=>{state.started=true;log('Welcome to Abuja. Find a job, manage your needs and build your life.');render()}
$('saveBtn').onclick=save;
$('newBtn').onclick=()=>{if(confirm('Start a completely new life?')){localStorage.removeItem(KEY);location.reload()}}
$('clearLog').onclick=()=>{state.log=[];renderLog()}
load();render();
