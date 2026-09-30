import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import QRCode from 'qrcode';

const execFileAsync = promisify(execFile);
const templateDirectory = fileURLToPath(new URL('.', import.meta.url));

const supportedLocales = new Map([
  ['es', 'data.es.json'],
  ['en', 'data.en.json']
]);

export async function loadCardData(locale = 'es') {
  const fileName = supportedLocales.get(locale);

  if (!fileName) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  return JSON.parse(await readFile(new URL(fileName, import.meta.url), 'utf8'));
}

function jsonForScript(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e');
}

export async function renderCardDocument(data, qrSvg, css = '') {
  const template = await readFile(new URL('index.html', import.meta.url), 'utf8');

  return template
    .replace('{{LOCALE}}', data.locale)
    .replace('{{CARD_BASE_URL}}', pathToFileURL(`${templateDirectory}/`).href)
    .replace('{{CARD_CSS}}', css)
    .replace('{{CARD_DATA}}', jsonForScript(data))
    .replace('{{CARD_QR_SVG}}', qrSvg);
}

async function compileCss(directory) {
  const outputPath = join(directory, 'presentation-card.css');
  const cliPath = resolve('node_modules/@tailwindcss/cli/dist/index.mjs');

  await execFileAsync(process.execPath, [
    cliPath,
    '--input', join(templateDirectory, 'input.css'),
    '--output', outputPath,
    '--minify'
  ]);
  return readFile(outputPath, 'utf8');
}

async function createQrSvg(url) {
  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 0,
    width: 192
  });
}

export async function renderCard({ locale = 'es', outputPath } = {}) {
  const data = await loadCardData(locale);
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'kva-card-render-'));
  const targetPath = outputPath
    ? resolve(outputPath)
    : join(templateDirectory, 'output', `kva-it-onepager-${locale}.pdf`);

  try {
    const [css, qrSvg] = await Promise.all([
      compileCss(temporaryDirectory),
      createQrSvg(data.portfolioUrl)
    ]);
    const document = await renderCardDocument(data, qrSvg, css);
    const htmlPath = join(temporaryDirectory, 'presentation-card.html');
    await (await import('node:fs/promises')).writeFile(htmlPath, document);

    let browser;
    try {
      browser = await chromium.launch();
    } catch (error) {
      throw new Error('Playwright Chromium is unavailable. Run "pnpm exec playwright install chromium".', { cause: error });
    }

    try {
      const page = await browser.newPage();
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
      const overflow = await page.locator('.card').evaluate((card) => card.scrollHeight > card.clientHeight);
      if (overflow) {
        throw new Error('Presentation card content overflows the single Letter page.');
      }

      await mkdir(dirname(targetPath), { recursive: true });
      await page.pdf({
        path: targetPath,
        format: 'Letter',
        printBackground: true,
        preferCSSPageSize: true
      });
    } finally {
      await browser.close();
    }

    return targetPath;
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

export function parseLocale(argumentsList) {
  if (argumentsList[0] === '--') argumentsList = argumentsList.slice(1);
  if (argumentsList.length === 0) return 'es';
  if (argumentsList.length === 2 && argumentsList[0] === '--locale') return argumentsList[1];
  throw new Error('Usage: node templates/presentation_card/render.mjs [--locale es|en]');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const locale = parseLocale(process.argv.slice(2));
  renderCard({ locale })
    .then((outputPath) => console.log(`Presentation card written to ${outputPath}`))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
