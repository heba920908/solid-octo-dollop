import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import { loadCardData, parseLocale, renderCard, renderCardDocument } from './render.mjs';

test('loads the Spanish card data contract', async () => {
  const card = await loadCardData('es');

  assert.equal(card.locale, 'es-MX');
  assert.equal(card.portfolioUrl, 'https://kvamentescreativas.com');
  assert.equal(card.services.length, 5);
  assert.equal(card.contacts.length, 3);
  assert.equal(card.phone, '+525583537536');
  assert.equal(card.contacts[1].role, 'Atención Estratégica y Enlace Ejecutivo');
});

test('rejects an unsupported locale before rendering', async () => {
  await assert.rejects(loadCardData('fr'), /Unsupported locale: fr/);
});

test('accepts pnpm argument forwarding for a locale build', () => {
  assert.equal(parseLocale(['--', '--locale', 'en']), 'en');
});

test('renders all Spanish card sections with vector assets', async () => {
  const card = await loadCardData('es');
  const document = await renderCardDocument(card, '<svg id="card-qr"></svg>');

  assert.match(document, new RegExp(card.pitch));
  for (const service of card.services) {
    assert.match(document, new RegExp(service.title));
  }
  assert.match(document, /assets\/media\/logo\.svg/);
  assert.match(document, new RegExp(card.portfolioUrl));
  assert.match(document, /<svg id="card-qr"><\/svg>/);
  assert.ok(document.includes(card.phone));
  assert.match(document, /phone\.href = `tel:\$\{cardData\.phone\}`/);
});

test('localizes visible section headings', async () => {
  const card = await loadCardData('en');
  const document = await renderCardDocument(card, '<svg id="card-qr"></svg>');

  assert.match(document, new RegExp(card.labels.services));
  assert.match(document, new RegExp(card.labels.differentiators));
  assert.doesNotMatch(document, /Servicios clave|Por qué kVA IT/);
});

async function extractPdfText(path) {
  const document = await getDocument({ data: new Uint8Array(await readFile(path)) }).promise;
  assert.equal(document.numPages, 1);
  const page = await document.getPage(1);
  const content = await page.getTextContent();
  return content.items.map((item) => item.str).join(' ');
}

test('renders selectable Spanish text into a single-page PDF', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'kva-card-'));
  const outputPath = join(directory, 'card-es.pdf');
  t.after(() => rm(directory, { recursive: true, force: true }));

  const result = await renderCard({ locale: 'es', outputPath });

  assert.equal(result, outputPath);
  assert.match(await extractPdfText(outputPath), /Migración Cloud/);
});

test('renders English and rejects invalid locales without creating artifacts', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'kva-card-'));
  const outputPath = join(directory, 'card-en.pdf');
  const rejectedPath = join(directory, 'card-fr.pdf');
  t.after(() => rm(directory, { recursive: true, force: true }));

  await renderCard({ locale: 'en', outputPath });
  assert.match(await extractPdfText(outputPath), /Cloud Migration/);
  await assert.rejects(renderCard({ locale: 'fr', outputPath: rejectedPath }), /Unsupported locale: fr/);
  await assert.rejects(readFile(rejectedPath));
});
