import type { FaqGroup } from '@merqo/ui';

import { PRICING_LINE } from '@/components/landing/faq';

export const FAQ_TITLE = 'Frequently asked questions';

export const FAQ_INTRO =
  'Short answers about stockkit, the stock tracker for small vendors, which is in build.';

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'getting-started',
    heading: 'Getting started',
    rows: [
      {
        q: 'How do I get on the list?',
        a: 'stockkit is in build and has not been tried with vendors yet. Tap Join the waitlist on the stockkit home page and leave your email.',
      },
      {
        q: 'What do I need to use stockkit?',
        a: 'A phone or computer with a web browser, an internet connection, and a sign-in with Google or an email and password. There is no app to install.',
      },
      {
        q: 'What do I enter for each product?',
        a: 'A name, a unit such as kg or pcs, what one unit costs you, how many you have to start, and a low-stock number. You can edit these later.',
      },
    ],
  },
  {
    id: 'day-to-day',
    heading: 'Day to day',
    rows: [
      {
        q: 'Does stockkit track sales automatically?',
        a: 'No. You log stock in and out by hand, and stockkit works out your stock value.',
      },
      {
        q: 'What counts as a stock movement?',
        a: 'Restock (adding stock), waste (removing spoiled/lost stock), or adjustment (correcting a count). Every movement is kept as a permanent record.',
      },
      {
        q: 'What if I log the wrong number?',
        a: 'You cannot edit or delete a past entry. Log an adjustment to correct the count, up or down, and the old entry stays in the history.',
      },
      {
        q: 'How will I know when stock is low?',
        a: 'Set a low-stock number on each product. When the count drops to that number or below, the product shows as low stock on your dashboard, and as out of stock at zero. stockkit does not send texts or emails.',
      },
    ],
  },
  {
    id: 'cost-data-and-other-kits',
    heading: 'Cost, data and other kits',
    rows: [
      { q: 'What will it cost?', a: PRICING_LINE },
      {
        q: 'What information does stockkit keep?',
        a: "Your name, email and business name, plus the products, costs, counts and notes you enter. It does not hold your customers' details. Merqo does not check your counts against your real shelves.",
      },
      {
        q: 'Does stockkit connect to qkit or my other kits?',
        a: 'No. You log stock yourself, and stockkit does not read orders or payments from the other kits.',
      },
    ],
  },
];
