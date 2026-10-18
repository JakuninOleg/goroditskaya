// Small, interruptible interactions for the approved hybrid.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const answerAnimations=new WeakMap<HTMLElement,Animation>();
const faqButtons=[...document.querySelectorAll<HTMLButtonElement>('[data-faq-toggle]')];

function setFaq(button:HTMLButtonElement,open:boolean){
 const panel=document.getElementById(button.getAttribute('aria-controls')!) as HTMLElement|null;
 if(!panel)return;
 const from=panel.hidden?0:panel.getBoundingClientRect().height;
 const opacity=panel.hidden?0:Number(getComputedStyle(panel).opacity);
 answerAnimations.get(panel)?.cancel();
 button.setAttribute('aria-expanded',String(open));
 button.querySelector('svg path')?.setAttribute('d',open?'M5 12h14':'M12 5v14M5 12h14');
 panel.inert=!open;
 if(reducedMotion.matches){panel.hidden=!open;panel.style.removeProperty('height');panel.style.removeProperty('opacity');return;}
 panel.hidden=false;
 panel.style.height='auto';
 const to=open?panel.getBoundingClientRect().height:0;
 panel.style.height=from+'px';
 const animation=panel.animate([{height:from+'px',opacity},{height:to+'px',opacity:open?1:0}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
 answerAnimations.set(panel,animation);
 animation.onfinish=()=>{
  if(answerAnimations.get(panel)!==animation)return;
  panel.hidden=!open;
  panel.style.removeProperty('height');
  panel.style.removeProperty('opacity');
  animation.cancel();
  answerAnimations.delete(panel);
 };
}
faqButtons.forEach(button=>{
 const open=button.getAttribute('aria-expanded')==='true';
 button.querySelector('svg path')?.setAttribute('d',open?'M5 12h14':'M12 5v14M5 12h14');
 button.addEventListener('click',()=>{
  const next=button.getAttribute('aria-expanded')!=='true';
  faqButtons.forEach(other=>{if(other!==button&&other.getAttribute('aria-expanded')==='true')setFaq(other,false);});
  setFaq(button,next);
 });
});
reducedMotion.addEventListener('change',()=>{faqButtons.forEach(button=>setFaq(button,button.getAttribute('aria-expanded')==='true'));});

document.querySelectorAll<HTMLElement>('[data-chart-frame]').forEach(frame=>{
 const tooltip=frame.querySelector<HTMLElement>('[data-chart-tooltip]');
 if(!tooltip)return;
 const show=(point:Element)=>{
  const el=point as HTMLElement;
  tooltip.querySelector('[data-tooltip-month]')!.textContent=el.dataset.month??'';
  tooltip.querySelector('[data-tooltip-revenue]')!.textContent=(el.dataset.revenue??'')+' млн ₽';
  tooltip.querySelector('[data-tooltip-profit]')!.textContent=(el.dataset.profit??'')+' млн ₽';
  tooltip.hidden=false;
  const p=point.getBoundingClientRect(),bounds=frame.getBoundingClientRect();
  tooltip.style.left=Math.max(6,Math.min(bounds.width-tooltip.offsetWidth-6,p.left-bounds.left+p.width/2-tooltip.offsetWidth/2))+'px';
  tooltip.style.top='12px';
 };
 frame.querySelectorAll('[data-chart-point]').forEach(point=>{
  point.addEventListener('pointerenter',()=>show(point));
  point.addEventListener('focus',()=>show(point));
  point.addEventListener('click',()=>show(point));
  point.addEventListener('keydown',event=>{
   if((event as KeyboardEvent).key==='Escape')tooltip.hidden=true;
   if(['Enter',' '].includes((event as KeyboardEvent).key)){event.preventDefault();show(point);}
  });
  point.addEventListener('blur',()=>{tooltip.hidden=true;});
 });
 frame.addEventListener('pointerleave',()=>{if(!frame.contains(document.activeElement))tooltip.hidden=true;});
});

