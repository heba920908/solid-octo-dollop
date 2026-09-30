import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
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

export async function renderCardDocument(data, qrSvg, css = '', baseUrl = pathToFileURL(`${templateDirectory}/`).href) {
  const template = await readFile(new URL('index.html', import.meta.url), 'utf8');

  return template
    .replace('{{LOCALE}}', data.locale)
    .replace('{{CARD_BASE_URL}}', baseUrl)
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
    await writeFile(htmlPath, document);

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

export function parseCliOptions(argumentsList) {
  const preview = argumentsList.includes('--preview');
  const rest = argumentsList.filter((argument) => argument !== '--' && argument !== '--preview');
  if (rest.length === 0) return { locale: 'es', preview };
  if (rest.length === 2 && rest[0] === '--locale') return { locale: rest[1], preview };
  throw new Error('Usage: node templates/presentation_card/render.mjs [--preview] [--locale es|en]');
}

export function parseLocale(argumentsList) {
  return parseCliOptions(argumentsList).locale;
}

export async function writeCardPreview({ locale = 'es', outputPath } = {}) {
  const data = await loadCardData(locale);
  const targetPath = outputPath
    ? resolve(outputPath)
    : join(templateDirectory, 'output', `kva-it-onepager-${locale}.html`);
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'kva-card-preview-'));

  try {
    const [css, qrSvg] = await Promise.all([
      compileCss(temporaryDirectory),
      createQrSvg(data.portfolioUrl)
    ]);
    // Relative base keeps assets resolvable when opened from a Windows browser via \\wsl.localhost.
    const baseUrl = `${relative(dirname(targetPath), templateDirectory).split(sep).join('/')}/`;
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, await renderCardDocument(data, qrSvg, css, baseUrl));
    return targetPath;
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

const mediaDirectory = resolve(templateDirectory, '../../assets/media');
const contentTypes = new Map([
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg']
]);

async function resolveMediaFile(pathname) {
  let filePath;
  try {
    filePath = resolve(mediaDirectory, decodeURIComponent(pathname.slice('/assets/media/'.length)));
  } catch {
    return null;
  }
  if (!filePath.startsWith(`${mediaDirectory}${sep}`) || !contentTypes.has(extname(filePath))) return null;
  return (await stat(filePath).catch(() => null))?.isFile() ? filePath : null;
}

export async function startPreviewServer({ htmlPath, port = 4173, host = '127.0.0.1' }) {
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://localhost');
    try {
      const mediaFile = pathname.startsWith('/assets/media/') ? await resolveMediaFile(pathname) : null;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405).end();
      } else if (pathname === '/' || pathname === '/index.html') {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        response.end(await readFile(htmlPath));
      } else if (mediaFile) {
        response.writeHead(200, { 'content-type': contentTypes.get(extname(mediaFile)) });
        response.end(await readFile(mediaFile));
      } else {
        response.writeHead(404).end();
      }
    } catch {
      response.writeHead(500).end();
    }
  });

  await new Promise((ready, fail) => {
    server.once('error', fail);
    server.listen(port, host, ready);
  });
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { locale, preview } = parseCliOptions(process.argv.slice(2));
  const task = preview
    ? writeCardPreview({ locale }).then(async (htmlPath) => {
      console.log(`Presentation card written to ${htmlPath}`);
      const server = await startPreviewServer({ htmlPath });
      return `Preview served at http://localhost:${server.address().port}/ (Ctrl+C to stop)`;
    })
    : renderCard({ locale }).then((outputPath) => `Presentation card written to ${outputPath}`);
  task
    .then((message) => console.log(message))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
