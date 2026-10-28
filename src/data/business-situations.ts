import { serviceHref } from './services';
import { articleHref } from './articles';

export type SituationArt = 'payments' | 'projects' | 'review';
type ReadingLink = { label: string; slug: string };
export const homeSituations: { art: SituationArt; title: string; items: { question: string; answer: string; service: string; serviceLabel: string; reading?: ReadingLink }[] }[] = [
  { art: 'payments', title: 'Деньги и решения', items: [
    { question: 'Прибыль есть, а денег нет?', answer: 'Деньги могут оставаться в дебиторской задолженности, запасах и незавершённых заказах. Сопоставим их с предстоящими платежами и найдём причину кассового разрыва вашего бизнеса.', service: 'finansovaya-diagnostika', serviceLabel: 'Финансовая диагностика', reading: { label: 'Как найти причину кассового разрыва', slug: 'prichiny-kassovogo-razryva' } },
    { question: 'Можно ли нанимать сотрудников и расширяться?', answer: 'Посчитаем, какую выручку должна обеспечить новая команда, когда появятся поступления и хватит ли денег на зарплату до этого момента. Сравним сценарии в финансовой модели.', service: 'finansovaya-model', serviceLabel: 'Финансовая модель' }
  ] },
  { art: 'projects', title: 'Прибыль и учёт', items: [
    { question: 'Какой проект приносит прибыль?', answer: 'Выручка по договору ещё не показывает результат проекта. Проверим прямые затраты, незавершённые работы и распределение общих расходов, чтобы увидеть полную себестоимость.', service: 'upravlencheskiy-uchet-proizvodstva', serviceLabel: 'Управленческий учёт', reading: { label: 'Как связаны бухгалтерский и управленческий учёт', slug: 'vzaimosvyaz-buhgalterskogo-i-upravlencheskogo-ucheta' } },
    { question: 'Почему отчёты до сих пор собирают вручную?', answer: 'Разберём путь от первичного документа до отчёта собственнику: где данные переносят повторно, какие правила не согласованы и что нужно настроить в 1С.', service: 'avtomatizatsiya-ucheta-1c', serviceLabel: 'Автоматизация учёта в 1С', reading: { label: 'Карта взаимосвязей участков учёта', slug: 'karta-vzaimosvyazey-uchastkov-ucheta' } }
  ] },
  { art: 'review', title: 'Документы и проверки', items: [
    { question: 'Почему банк отказал в кредите?', answer: 'Изучим запрос банка, отчётность и долговую нагрузку вашего бизнеса. Проверим источники погашения и подготовим расчёты, которые объясняют потребность в финансировании.', service: 'gotovnost-k-finansirovaniyu', serviceLabel: 'Подготовка к финансированию' },
    { question: 'Получили требование налоговой — что проверить?', answer: 'Сопоставим вопрос инспекции с декларациями, учётной базой и документами по операциям. Определим, где нужны пояснения, сверка или исправление данных.', service: 'nalogovyy-konsultant', serviceLabel: 'Налоговое консультирование', reading: { label: 'Причины расхождений НДС и налога на прибыль', slug: 'rashozhdeniya-nds-i-naloga-na-pribyl' } }
  ] }
];

export const serviceSituations: Record<string, { art: SituationArt; intro: string; reading?: ReadingLink }> = {
  'finansovyy-direktor-na-autsorse': { art: 'payments', intro: 'Отдельный отчёт не всегда даёт ответ собственнику. Свяжем прибыль, деньги и обязательства вашего бизнеса.', reading: { label: 'Почему прибыль не совпадает с остатком денег', slug: 'prichiny-kassovogo-razryva' } },
  'finansovaya-diagnostika': { art: 'payments', intro: 'Начнём с вопроса, на который сейчас трудно ответить по вашим отчётам.', reading: { label: 'Как найти причину кассового разрыва', slug: 'prichiny-kassovogo-razryva' } },
  'upravlencheskiy-uchet-proizvodstva': { art: 'projects', intro: 'Выручку видно сразу. Прибыль проекта становится понятна, когда учтены все связанные с ним затраты.', reading: { label: 'Как связаны два вида учёта', slug: 'vzaimosvyaz-buhgalterskogo-i-upravlencheskogo-ucheta' } },
  'finansovaya-model': { art: 'payments', intro: 'До найма, инвестиций или роста производства нужно оценить, как решение повлияет на деньги вашего бизнеса.' },
  'gotovnost-k-finansirovaniyu': { art: 'review', intro: 'Банку нужны согласованные данные и понятный источник возврата денег. Разберём, чего не хватает в вашем пакете.' },
  'avtomatizatsiya-ucheta-1c': { art: 'projects', intro: 'Если 1С уже работает, а отчёты всё ещё собирают в Excel, проверим данные, аналитику и правила расчёта.', reading: { label: 'Путь от операции до отчёта собственнику', slug: 'karta-vzaimosvyazey-uchastkov-ucheta' } },
  'vosstanovlenie-ucheta': { art: 'review', intro: 'Сначала определим, где нарушена связь между документами, учётной базой и сданной отчётностью.', reading: { label: 'Что можно увидеть при анализе ОСВ', slug: 'analiz-osv-pered-vosstanovleniem-ucheta' } },
  'uchet-goz': { art: 'projects', intro: 'По каждому контракту должны прослеживаться затраты, расчёты и подтверждающие документы вашего бизнеса.' },
  'niokr-nma': { art: 'projects', intro: 'Проверим, что создано в ходе разработки, кому принадлежат права и с каким результатом связаны затраты.' },
  'podgotovka-k-due-diligence': { art: 'review', intro: 'Инвестору важно проследить цифры до документов. Заранее найдём расхождения, которые затрудняют проверку вашего бизнеса.' },
  'nalogovyy-konsultant': { art: 'review', intro: 'Начинаем с конкретного вопроса: требования инспекции, спорной операции или расхождений в отчётности.', reading: { label: 'Почему расходятся декларации по прибыли и НДС', slug: 'rashozhdeniya-nds-i-naloga-na-pribyl' } },
  'nalogovaya-proverka': { art: 'review', intro: 'Стадия проверки определяет дальнейшие действия. Разберём требования и материалы по каждому спорному эпизоду.' },
  'yurist-dlya-biznesa': { art: 'review', intro: 'Свяжем условия договоров с тем, как ваш бизнес исполняет обязательства, получает оплату и подтверждает работу.' }
};

export const caseSituations: Record<string, { art: SituationArt; question: string; answer: string; service: string; serviceLabel: string; reading?: ReadingLink }> = {
  'niokr-62-mln': { art: 'projects', question: 'Вложения в разработки есть. А результат виден в учёте?', answer: 'Если у вашего бизнеса есть собственная технология, проверим связь между объектом разработки, правами и подтверждёнными затратами. Затем определим, как отражать результат в учёте.', service: 'niokr-nma', serviceLabel: 'Учёт НИОКР и нематериальных активов' },
  'erp-proektnyy-uchet': { art: 'projects', question: 'Проектов много. Какие из них приносят прибыль?', answer: 'Для вашей компании можно выстроить аналитику по договорам, затратам и незавершённым работам. Начнём с правил расчёта себестоимости и данных, которые уже есть в 1С.', service: 'upravlencheskiy-uchet-proizvodstva', serviceLabel: 'Управленческий учёт по проектам', reading: { label: 'Как связаны бухгалтерский и управленческий учёт', slug: 'vzaimosvyaz-buhgalterskogo-i-upravlencheskogo-ucheta' } },
  'vosstanovlenie-ucheta-it-gruppy': { art: 'review', question: 'Можно ли доверять сданной отчётности?', answer: 'Сверим данные вашей учётной базы с документами и отчётностью. Определим периоды, участки и последовательность восстановления учёта.', service: 'vosstanovlenie-ucheta', serviceLabel: 'Восстановление учёта', reading: { label: 'С чего начать анализ ОСВ', slug: 'analiz-osv-pered-vosstanovleniem-ucheta' } },
  'finansovaya-model-proizvodstva': { art: 'payments', question: 'Выручка растёт. Сколько денег нужно для роста?', answer: 'В финансовой модели вашего бизнеса свяжем закупки, выпуск, продажи и сроки оплаты. Посчитаем потребность в оборотных средствах и сравним сценарии финансирования.', service: 'finansovaya-model', serviceLabel: 'Финансовая модель', reading: { label: 'Откуда берётся кассовый разрыв', slug: 'prichiny-kassovogo-razryva' } },
  'podgotovka-k-proverke-investora': { art: 'review', question: 'Готовы ли ваши данные к вопросам инвестора?', answer: 'Проверим, можно ли подтвердить выручку, расходы, активы и обязательства вашего бизнеса. Найдём противоречия до передачи материалов на due diligence.', service: 'podgotovka-k-due-diligence', serviceLabel: 'Подготовка к due diligence' },
  'kontrol-zatrat-stroitelstva': { art: 'projects', question: 'Смета есть. А фактическая себестоимость проекта понятна?', answer: 'Свяжем бюджет вашего проекта с договорами, актами, оплатами и фактическими затратами. Согласуем, как учитывать незавершённые работы и объяснять отклонения.', service: 'upravlencheskiy-uchet-proizvodstva', serviceLabel: 'Проектный управленческий учёт' },
  'kapitalnye-zatraty-proizvodstva': { art: 'projects', question: 'Что относится к текущим расходам, а что — к вложениям?', answer: 'Разберём назначение затрат вашего бизнеса и документы по объектам. Проверим состав капитальных вложений и их отражение в учётной базе.', service: 'vosstanovlenie-ucheta', serviceLabel: 'Проверка и восстановление учёта' },
  'dogovory-i-proektnyy-uchet-it': { art: 'projects', question: 'Договоры и учёт описывают один и тот же проект?', answer: 'Сопоставим этапы работ, документы, затраты и расчёты с заказчиком. Определим, какая аналитика нужна вашей команде для контроля результата проекта.', service: 'upravlencheskiy-uchet-proizvodstva', serviceLabel: 'Управленческий учёт', reading: { label: 'Карта взаимосвязей участков учёта', slug: 'karta-vzaimosvyazey-uchastkov-ucheta' } },
  'bankovskie-garantii-proizvodstva': { art: 'review', question: 'Почему банк запрашивает дополнительные расчёты?', answer: 'Разберём требования банка и подготовим объяснение финансовых показателей вашего бизнеса. Проверим, как обязательства по контрактам связаны с запрашиваемым лимитом.', service: 'gotovnost-k-finansirovaniyu', serviceLabel: 'Подготовка к финансированию' }
};

export const situationServiceLink = (slug: string) => serviceHref(slug);
export const situationReadingLink = (slug: string) => articleHref(slug);
