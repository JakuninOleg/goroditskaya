import { attachRuPhoneMask, normalizeRuPhone } from '../lib/ru-phone';

const form=document.getElementById('contact-form') as HTMLFormElement|null;
const contactPhone=document.getElementById('contact-phone') as HTMLInputElement|null;
if(contactPhone)attachRuPhoneMask(contactPhone,{onValueChange:()=>contactPhone.setCustomValidity('')});
const message=form?.querySelector<HTMLTextAreaElement>('[name="message"]');
const requestedService=new URLSearchParams(window.location.search).get('service')?.trim().slice(0,180);
if(message&&requestedService&&!message.value)message.value=requestedService;
form?.addEventListener('submit',event=>{
  event.preventDefault();
  const phone=normalizeRuPhone(contactPhone?.value??'');
  contactPhone?.setCustomValidity(phone?'':'Укажите телефон полностью: +7 (999) 123-45-67.');
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const name=String(data.get('name')??'').trim();
  const company=String(data.get('company')??'').trim();
  const email=String(data.get('email')??'').trim();
  const task=String(data.get('message')??'').trim();
  const service=String(data.get('service')??requestedService??'').trim().slice(0,180);
  const body=['Наталья, добрый день!','','Меня зовут '+name+'.','Компания: '+(company||'не указана'),'Ваша почта: '+email,'Телефон: +'+phone,...(service?['Услуга: '+service]:[]),'','Задача:',task||'Хочу обсудить финансовую задачу бизнеса.','','Прошу предложить возможный состав работ и формат сотрудничества.'].join('\n');
  // shortcut: retain mailto until the owner connects server delivery; never show a sent state here.
  window.location.href='mailto:gorodickaya@yandex.ru?subject='+encodeURIComponent('Обсуждение проекта'+(company?': '+company:''))+'&body='+encodeURIComponent(body);
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
  window.location.href='mailto:gorodickaya@yandex.ru?subject='+encodeURIComponent('Запрос Excel-форм')+'&body='+encodeURIComponent(body);
});
