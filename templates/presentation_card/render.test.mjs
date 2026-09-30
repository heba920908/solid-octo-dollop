import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { chromium } from 'playwright';

import { loadCardData, parseCliOptions, parseLocale, renderCard, renderCardDocument, startPreviewServer, writeCardPreview } from './render.mjs';

test('loads the Spanish card data contract', async () => {
  const card = await loadCardData('es');

  assert.equal(card.locale, 'es-MX');
  assert.equal(card.portfolioUrl, 'https://kvamentescreativas.com');
  assert.equal(card.services.length, 5);
  assert.equal(card.contacts.length, 2);
  assert.equal(card.phone, '+525583537536');
  assert.equal(card.phoneDisplay, '+52 55 8353 7536');
  assert.equal(card.contacts[1].role, 'Estrategia de TI y Consultoría');
});

test('rejects an unsupported locale before rendering', async () => {
  await assert.rejects(loadCardData('fr'), /Unsupported locale: fr/);
});

test('accepts pnpm argument forwarding for a locale build', () => {
  assert.equal(parseLocale(['--', '--locale', 'en']), 'en');
});

test('parses the preview flag with forwarded locale arguments', () => {
  assert.deepEqual(parseCliOptions(['--preview', '--', '--locale', 'en']), { locale: 'en', preview: true });
  assert.deepEqual(parseCliOptions([]), { locale: 'es', preview: false });
  assert.throws(() => parseCliOptions(['--pdf']), /Usage/);
});

test('writes a self-contained HTML preview that resolves template assets', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'kva-card-'));
  const outputPath = join(directory, 'card-en.html');
  t.after(() => rm(directory, { recursive: true, force: true }));

  const result = await writeCardPreview({ locale: 'en', outputPath });
  const html = await readFile(outputPath, 'utf8');
  const baseHref = html.match(/<base href="([^"]+)">/)[1];

  assert.equal(result, outputPath);
  assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/);
  assert.match(html, /--kva-black/);
  assert.match(html, /<svg[^>]*>.*<path/s);
  assert.doesNotMatch(baseHref, /^file:/);
  assert.equal(new URL(baseHref, pathToFileURL(outputPath)).href, new URL('./', import.meta.url).href);
});

test('serves the generated preview and brand assets only', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'kva-card-'));
  const htmlPath = join(directory, 'card-es.html');
  await writeCardPreview({ locale: 'es', outputPath: htmlPath });
  const server = await startPreviewServer({ htmlPath, port: 0 });
  t.after(async () => {
    await new Promise((done) => server.close(done));
    await rm(directory, { recursive: true, force: true });
  });
  const origin = `http://127.0.0.1:${server.address().port}`;

  const page = await fetch(`${origin}/`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.equal(await page.text(), await readFile(htmlPath, 'utf8'));

  const logo = await fetch(`${origin}/assets/media/logo.svg`);
  assert.equal(logo.status, 200);
  assert.match(logo.headers.get('content-type'), /image\/svg\+xml/);

  for (const path of ['/package.json', '/assets/media/..%2F..%2Fpackage.json', '/assets/media/missing.svg']) {
    assert.equal((await fetch(`${origin}${path}`)).status, 404, path);
  }
});

test('uses legible light-gray panels for services and strengths', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'kva-card-'));
  const htmlPath = join(directory, 'card-es.html');
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeCardPreview({ locale: 'es', outputPath: htmlPath });
  const server = await startPreviewServer({ htmlPath, port: 0 });
  t.after(() => new Promise((done) => server.close(done)));
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  assert.equal(await page.locator('#contact-heading').textContent(), 'Habla con un experto');
  assert.equal(await page.locator('#phone-link').getAttribute('href'), 'tel:+525583537536');
  assert.equal(await page.locator('#phone-link').textContent(), '+52 55 8353 7536');
  assert.equal(await page.locator('#email-link').getAttribute('href'), 'mailto:anatasidomi@hotmail.com');
  assert.equal(await page.locator('.service-card svg.card-icon[aria-hidden="true"]').count(), 5);
  assert.equal(await page.locator('.digital-contact svg.card-icon[aria-hidden="true"]').count(), 3);
  assert.deepEqual(await page.locator('.service-card svg.card-icon use').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href'))),
  ['#icon-cloud', '#icon-chart', '#icon-cube', '#icon-shield', '#icon-sparkles']);
  assert.match(await page.locator('#icon-sparkles path').getAttribute('d'), /^M9\.813 15\.904L9 18\.75/);
  assert.deepEqual(await page.locator('.digital-contact svg.card-icon use').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href'))),
  ['#icon-globe', '#icon-mail', '#icon-phone']);
  const footerInset = await page.locator('.card').evaluate((card) =>
    card.getBoundingClientRect().bottom - card.querySelector('.contact-bar').getBoundingClientRect().bottom);
  assert.ok(footerInset <= 45, 'Contact callout should sit at the bottom of the card');

  const panels = await page.evaluate(() => {
    const colors = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return { background: style.backgroundColor, foreground: style.color };
    };
    return {
      firstService: colors('.service-card'),
      firstDescription: colors('.service-card p'),
      secondService: colors('.service-card:nth-child(2)'),
      secondDescription: colors('.service-card:nth-child(2) p'),
      differentiators: colors('.differentiators'),
    };
  });
  assert.equal(panels.firstService.background, 'rgb(245, 245, 245)');
  assert.equal(panels.secondService.background, 'rgb(229, 229, 229)');
  assert.equal(panels.differentiators.background, 'rgb(229, 229, 229)');

  const luminance = (color) => {
    const channels = color.match(/\d+/g).slice(0, 3).map((channel) => {
      const value = Number(channel) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const [text, surface] of [
    [panels.firstDescription, panels.firstService],
    [panels.secondDescription, panels.secondService],
  ]) {
    const values = [luminance(text.foreground), luminance(surface.background)].sort((a, b) => b - a);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5, 'Supporting text must meet WCAG AA contrast');
  }
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
  assert.ok(document.includes(card.phoneDisplay));
  assert.match(document, /phone\.href = `tel:\$\{cardData\.phone\}`/);
});

test('localizes visible section headings', async () => {
  const card = await loadCardData('en');
  const document = await renderCardDocument(card, '<svg id="card-qr"></svg>');

  assert.match(document, new RegExp(card.labels.services));
  assert.match(document, new RegExp(card.labels.differentiators));
  assert.match(document, new RegExp(card.labels.contact));
  assert.doesNotMatch(document, /Servicios clave|Por qué kVA IT/);
});

test('omits metric claims and includes the five strengths in both locales', async () => {
  for (const locale of ['es', 'en']) {
    const card = await loadCardData(locale);
    const document = await renderCardDocument(card, '<svg id="card-qr"></svg>');
    assert.equal(card.differentiators.length, 5);
    assert.equal(card.metrics, undefined);
    assert.equal(card.labels.metrics, undefined);
    assert.deepEqual(card.services.map((service) => service.icon), ['cloud', 'chart', 'cube', 'shield', 'sparkles']);
    assert.doesNotMatch(document, /class="metrics"|id="metrics"|cardData\.metrics|< 5%|30% - 50%|3 - 14|90-day|90 días/i);
    for (const strength of card.differentiators) {
      assert.ok(document.includes(strength));
    }
  }
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

const hexColors = (source) => (source.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) ?? []).map((hex) => {
  const value = hex.slice(1).toLowerCase();
  return `#${value.length === 3 ? [...value].map((c) => c + c).join('') : value}`;
});

test('uses only BRAND palette colors in card styles and logo', async () => {
  const brand = await readFile(new URL('../../.github/rules/BRAND.md', import.meta.url), 'utf8');
  const palette = new Set(hexColors(brand.split('## Surface Mappings')[0]));
  assert.ok(palette.has('#000000') && palette.has('#ffffff'));

  for (const file of ['input.css', '../../assets/media/logo.svg']) {
    const source = await readFile(new URL(file, import.meta.url), 'utf8');
    const offPalette = hexColors(source).filter((hex) => !palette.has(hex));
    assert.deepEqual(offPalette, [], `${file} uses colors outside BRAND.md`);
  }
});
