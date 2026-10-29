import { site } from '../data/site';
import { attachRuPhoneMask, normalizeRuPhone } from '../lib/ru-phone';

async function sendLead(form:HTMLFormElement,fields:Record<string,string>,successText:string){
  if(form.dataset.submitting==='true')return;
  const status=form.querySelector<HTMLElement>('.form-feedback');
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label=button?.querySelector<HTMLElement>('[data-submit-label]');
  const initialLabel=label?.textContent??'';
  const data=new FormData(form);
  const payload={...fields,consent:data.get('consent')==='on',consentVersion:String(data.get('consent_version')??''),website:String(data.get('website')??'')};
  const serialized=JSON.stringify(payload);
  if(form.dataset.lastPayload!==serialized){form.dataset.requestId=crypto.randomUUID();form.dataset.lastPayload=serialized;}
  form.dataset.submitting='true';
  form.setAttribute('aria-busy','true');
  if(button)button.disabled=true;
  if(label)label.textContent='Отправляем…';
  if(status){status.dataset.state='pending';status.textContent='Отправляем вашу заявку…';}
  let failureMessage='';
  try{
    const response=await fetch(import.meta.env.PUBLIC_LEAD_API_URL||site.leadEndpoint,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...payload,requestId:form.dataset.requestId}),signal:AbortSignal.timeout(20_000),
    });
    const result=await response.json();
    if(!response.ok||result.ok!==true){
      failureMessage=response.status===429?'Слишком много попыток. Подождите минуту и отправьте заявку ещё раз.':response.status===400?'Проверьте контакт и согласие. Если страница была открыта давно, обновите её перед отправкой.':'Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами по телефону.';
      throw new Error('delivery_failed');
    }
    document.dispatchEvent(new CustomEvent('site:lead-success',{detail:{kind:fields.kind==='templates'?'templates':'consultation'}}));
    form.reset();
    delete form.dataset.lastPayload;delete form.dataset.requestId;
    if(status){status.dataset.state='success';status.textContent=successText;}
  }catch{
    if(status){status.dataset.state='error';status.textContent=failureMessage||'Не удалось связаться с сервером. Данные сохранены в форме — попробуйте отправить ещё раз.';}
  }finally{
    delete form.dataset.submitting;form.removeAttribute('aria-busy');
    if(button)button.disabled=false;if(label)label.textContent=initialLabel;
  }
}


const form=document.getElementById('contact-form') as HTMLFormElement|null;
const contactPhone=document.getElementById('contact-phone') as HTMLInputElement|null;
if(contactPhone)attachRuPhoneMask(contactPhone,{onValueChange:()=>contactPhone.setCustomValidity('')});
const contactEmail=document.getElementById('contact-email') as HTMLInputElement|null;
const methodLabel=document.getElementById('contact-method-label') as HTMLLabelElement|null;
const methodCaption=form?.querySelector<HTMLElement>('[data-contact-caption]');
const channelToggle=form?.querySelector<HTMLButtonElement>('.contact-channel-toggle');
channelToggle?.addEventListener('click',()=>{
  if(!contactPhone||!contactEmail||!methodLabel||!methodCaption)return;
  const useEmail=contactEmail.disabled;
  contactPhone.hidden=useEmail;
  contactPhone.disabled=useEmail;
  contactPhone.required=!useEmail;
  contactPhone.setCustomValidity('');
  contactEmail.hidden=!useEmail;
  contactEmail.disabled=!useEmail;
  contactEmail.required=useEmail;
  methodLabel.htmlFor=useEmail?'contact-email':'contact-phone';
  methodCaption.textContent=useEmail?'Ваша почта':'Телефон';
  channelToggle.textContent=useEmail?'Удобнее по телефону?':'Удобнее по почте?';
  (useEmail?contactEmail:contactPhone).focus({preventScroll:true});
});
const requestedService=new URLSearchParams(window.location.search).get('service')?.trim().slice(0,180);
const serviceField=form?.querySelector<HTMLInputElement>('[name="service"]');
if(serviceField&&!serviceField.value&&requestedService)serviceField.value=requestedService;
form?.addEventListener('submit',event=>{
  event.preventDefault();
  const useEmail=contactEmail&&!contactEmail.disabled;
  const phone=useEmail?null:normalizeRuPhone(contactPhone?.value??'');
  if(!useEmail)contactPhone?.setCustomValidity(phone?'':'Укажите телефон полностью: +7 (999) 123-45-67.');
  if(useEmail)contactEmail.value=contactEmail.value.trim();
  if(!form.reportValidity())return;
  const data=new FormData(form);
  void sendLead(form,{kind:'consultation',name:String(data.get('name')??'').trim(),
    email:useEmail?String(data.get('email')??'').trim():'',phone:useEmail?'':phone!,
    message:String(data.get('message')??'').trim(),service:String(data.get('service')??'').trim().slice(0,180),
    page:window.location.pathname},'Заявка отправлена. Мы свяжемся с вами по указанному контакту.');
});
const templatesForm=document.getElementById('templates-form') as HTMLFormElement|null;
const templatesPhone=document.getElementById('templates-phone') as HTMLInputElement|null;
if(templatesPhone)attachRuPhoneMask(templatesPhone,{onValueChange:()=>templatesPhone.setCustomValidity('')});
templatesForm?.addEventListener('submit',event=>{
  event.preventDefault();
  const phone=normalizeRuPhone(templatesPhone?.value??'');
  templatesPhone?.setCustomValidity(phone?'':'Укажите телефон полностью: +7 (999) 123-45-67.');
  if(!templatesForm.reportValidity())return;
  const data=new FormData(templatesForm);
  void sendLead(templatesForm,{kind:'templates',email:String(data.get('email')??'').trim(),phone:phone!,
    page:window.location.pathname},'Запрос отправлен. Пришлём комплект на указанную почту.');
});
