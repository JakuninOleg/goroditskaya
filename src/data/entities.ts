import { primaryOrigin } from './seo.ts';
import { site } from './site.ts';

export const entityIds = {
  organization: primaryOrigin + '/#organization',
  person: primaryOrigin + '/o-natale/#natalia',
  website: primaryOrigin + '/#website',
};

// Shared identities connect the visible brand, author, services and publications.
export const siteEntities = [
  {
    '@type': 'Organization', '@id': entityIds.organization,
    name: site.brand, url: primaryOrigin + '/',
    description: 'Финансовое управление, бухгалтерский и налоговый учёт, налоговая безопасность и юридическая помощь вашему бизнесу. Работаем по всей России.',
    logo: { '@type': 'ImageObject', url: primaryOrigin + '/brand/natalia-avatar.png', width: 512, height: 512 },
    email: site.email, telephone: site.phoneHref,
    areaServed: { '@type': 'Country', name: 'Россия' },
    contactPoint: {
      '@type': 'ContactPoint', contactType: 'Обращения по услугам',
      telephone: site.phoneHref, email: site.email,
      availableLanguage: ['ru'], areaServed: 'RU', url: primaryOrigin + '/kontakty/',
    },
  },
  {
    '@type': 'Person', '@id': entityIds.person,
    name: site.name, givenName: 'Наталья', familyName: 'Городицкая',
    url: primaryOrigin + '/o-natale/', jobTitle: site.role,
    description: 'Наталья Городицкая руководит финансовыми проектами команды «Городицкая и партнёры». В финансах и учёте с 2003 года.',
    image: primaryOrigin + '/images/hybrid/about-natalia-v3.webp',
    affiliation: { '@id': entityIds.organization },
    knowsAbout: ['Управленческий учёт', 'Финансовое моделирование', 'Бюджетирование', 'Восстановление учёта', 'Методология учёта в 1С'],
  },
  {
    '@type': 'WebSite', '@id': entityIds.website,
    name: site.brand, url: primaryOrigin + '/', inLanguage: 'ru-RU',
    publisher: { '@id': entityIds.organization },
  },
];
