import { FaqPage } from '@merqo/ui';

import { FAQ_GROUPS, FAQ_INTRO, FAQ_TITLE } from './faq-content';

export const metadata = { title: 'FAQ' };

export default function FaqRoute() {
  return <FaqPage title={FAQ_TITLE} intro={FAQ_INTRO} groups={FAQ_GROUPS} />;
}
