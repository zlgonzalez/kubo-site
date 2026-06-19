import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Card from '../Card.astro';

test('Card component renders correctly with input props', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Card, {
    props: {
      title: 'Hello Montessori',
      body: 'Nurturing independence in a prepared environment.',
      href: '/services',
    },
  });

  expect(html).toContain('href="/services"');
  expect(html).toContain('Hello Montessori');
  expect(html).toContain('Nurturing independence in a prepared environment.');
  expect(html).toContain('&rarr;');
});
