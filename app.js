const $ = s => document.querySelector(s);
const defaultTasks = [
  {id:1,name:'Finish Data Structures assignment',subject:'Data Structures',due:'2026-08-22',hours:3,importance:3,done:false},
  {id:2,name:'Review notes for Operating Systems',subject:'Operating Systems',due:'2026-08-24',hours:2,importance:2,done:false},
  {id:3,name:'Practice JavaScript array methods',subject:'Web Development',due:'2026-08-26',hours:1,importance:1,done:true}
];
let tasks = JSON.parse(localStorage.getItem('focusflow-tasks') || 'null') || defaultTasks;
const save = () => localStorage.setItem('focusflow-tasks', JSON.stringify(tasks));
const daysUntil = due => Math.max(0, Math.ceil((new Date(due+'T23:59:59') - new Date()) / 86400000));
const score = t => Math.max(1, Math.min(99, t.importance * 23 + Math.max(0, 28 - daysUntil(t.due) * 5) + t.hours * 2));
const formatDue = due => { const d=daysUntil(due); return d===0?'Due today':d===1?'Due tomorrow':`Due in ${d} days`; };
function render(){
  const list=$('#taskList'); list.innerHTML='';
  const sorted=[...tasks].sort((a,b)=>a.done-b.done || score(b)-score(a));
  sorted.forEach(t=>{const el=document.createElement('div');el.className='task'+(t.done?' done':''); const level=t.importance===3?'high':t.importance===2?'medium':'low';const label=t.importance===3?'HIGH':t.importance===2?'MEDIUM':'LOW';el.innerHTML=`<button class="check" aria-label="Mark task complete"></button><div class="task-info"><strong>${escapeHtml(t.name)}</strong><span>${escapeHtml(t.subject)} · ${formatDue(t.due)} · ${t.hours}h</span></div><span class="badge ${level}">${label}</span><button class="delete" aria-label="Delete task">×</button>`;el.querySelector('.check').onclick=()=>{t.done=!t.done;save();render()};el.querySelector('.delete').onclick=()=>{tasks=tasks.filter(x=>x.id!==t.id);save();render()};list.append(el)});
  $('#emptyState').style.display=tasks.length?'none':'block';
  const completed=tasks.filter(t=>t.done).length, total=tasks.length, hours=tasks.filter(t=>!t.done).reduce((sum,t)=>sum+Number(t.hours),0);
  $('#completedCount').textContent=completed;$('#weeklyTasks').textContent=`of ${total} tasks complete`;$('#studyHours').textContent=`${hours}h`;$('#completionRate').textContent=total?`${Math.round(completed/total*100)}%`:'0%';
  const next=tasks.filter(t=>!t.done).sort((a,b)=>score(b)-score(a))[0];$('#nextTask').textContent=next?next.name:'You’re all caught up!';$('#nextMeta').textContent=next?`${next.subject} · ${formatDue(next.due)}`:'Add a new task to keep your flow.';$('#focusScore').textContent=next?score(next):'—';renderChart();
}
function renderChart(){const labels=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], today=(new Date().getDay()+6)%7;$('#chart').innerHTML=labels.map((d,i)=>`<div class="bar-wrap"><div class="bar ${i===today?'today':''}" style="height:${[35,58,42,70,48,25,15][i]}%"></div><span>${d}</span></div>`).join('')}
function escapeHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
const modal=$('#taskModal');$('#openModal').onclick=()=>modal.showModal();$('#closeModal').onclick=()=>modal.close();
$('#taskForm').onsubmit=e=>{e.preventDefault();const name=$('#taskName').value.trim();tasks.push({id:Date.now(),name,subject:$('#subject').value.trim(),due:$('#dueDate').value,hours:+$('#hours').value,importance:+$('#importance').value,done:false});save();render();modal.close();e.target.reset();toast('Task added — nice move!')};
$('#clearDone').onclick=()=>{const count=tasks.filter(t=>t.done).length;if(count){tasks=tasks.filter(t=>!t.done);save();render();toast(`${count} completed task${count>1?'s':''} cleared.`)}};
$('#startFocus').onclick=()=>toast('Focus session started. You’ve got this!');
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2700)}
$('#today').textContent=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(new Date()).toUpperCase();
$('#dueDate').value=new Date(Date.now()+86400000).toISOString().slice(0,10);render();
