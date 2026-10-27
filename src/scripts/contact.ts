import { site } from '../data/site';
import { attachRuPhoneMask, normalizeRuPhone } from '../lib/ru-phone';

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
  const name=String(data.get('name')??'').trim();
  const email=String(data.get('email')??'').trim();
  const task=String(data.get('message')??'').trim();
  const service=String(data.get('service')??'').trim().slice(0,180);
  const page=String(data.get('page')??'').trim();
  const body=['Наталья, добрый день!','',...(name?['Меня зовут '+name+'.']:[]),useEmail?'Почта для связи: '+email:'Телефон для связи: +'+phone,...(service?['Услуга: '+service]:[]),...(page?['Страница обращения: '+page]:[]),'','Задача:',task||'Нужна консультация по финансовой задаче бизнеса.','','Прошу предложить возможный состав работ и формат сотрудничества.'].join('\n');
  // Retain the existing delivery route until server delivery is connected.
  window.location.href='mailto:'+site.email+'?subject='+encodeURIComponent('Заявка на консультацию'+(service?': '+service:''))+'&body='+encodeURIComponent(body);
});
const templatesForm=document.getElementById('templates-form') as HTMLFormElement|null;
const templatesPhone=document.getElementById('templates-phone') as HTMLInputElement|null;
if(templatesPhone)attachRuPhoneMask(templatesPhone,{onValueChange:()=>templatesPhone.setCustomValidity('')});
templatesForm?.addEventListener('submit',event=>{
  event.preventDefault();
  const phone=normalizeRuPhone(templatesPhone?.value??'');
  templatesPhone?.setCustomValidity(phone?'':'Укажите телефон полностью: +7 (999) 123-45-67.');
  if(!templatesForm.reportValidity())return;
  const email=String(new FormData(templatesForm).get('email')??'').trim();
  const body=['Наталья, добрый день!','','Пришлите, пожалуйста, комплект Excel-форм:','— ДДС на 13 недель','— Прибыль по проектам','— План-факт бюджета','','Моя почта: '+email,'Телефон: +'+phone].join('\n');
  window.location.href='mailto:'+site.email+'?subject='+encodeURIComponent('Запрос Excel-форм')+'&body='+encodeURIComponent(body);
});
