const pageUrl = 'https://www.wildnutrition.com/';
const headers = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

async function fetchText(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function attrValue(tag, attrName) {
  const pattern = new RegExp(`${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = tag.match(pattern);
  return match ? match[1] ?? match[2] ?? match[3] : '';
}

function findStylesheetLinks(html, baseUrl) {
  const links = [];
  const linkTagPattern = /<link\b[^>]*>/gi;

  for (const [tag] of html.matchAll(linkTagPattern)) {
    const rel = attrValue(tag, 'rel').toLowerCase();
    const href = attrValue(tag, 'href');

    if (!href || !rel.split(/\s+/).includes('stylesheet')) continue;

    links.push(new URL(href, baseUrl).href);
  }

  return [...new Set(links)];
}

function splitFontFamilyList(value) {
  const fonts = [];
  let current = '';
  let quote = null;

  for (const char of value) {
    if ((char === '"' || char === "'") && quote === null) {
      quote = char;
      current += char;
    } else if (char === quote) {
      quote = null;
      current += char;
    } else if (char === ',' && quote === null) {
      fonts.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) fonts.push(current);
  return fonts;
}

function cleanFontName(name) {
  const cleaned = name
    .trim()
    .replace(/\s*!important\s*$/i, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\\(["'])/g, '$1')
    .trim();

  if (!cleaned || /[=&]/.test(cleaned) || /^var\(/i.test(cleaned)) return '';
  return cleaned;
}

function extractFontFamilies(css) {
  const fonts = new Set();
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const declarationPattern = /font-family\s*:\s*([^;}]+)/gi;

  for (const match of withoutComments.matchAll(declarationPattern)) {
    for (const rawName of splitFontFamilyList(match[1])) {
      const fontName = cleanFontName(rawName);
      if (fontName) fonts.add(fontName);
    }
  }

  return fonts;
}

const html = await fetchText(pageUrl);
const stylesheetUrls = findStylesheetLinks(html, pageUrl);
const allFonts = new Set();

for (const stylesheetUrl of stylesheetUrls) {
  const css = await fetchText(stylesheetUrl);
  for (const font of extractFontFamilies(css)) {
    allFonts.add(font);
  }
}

console.log([...allFonts].sort((a, b) => a.localeCompare(b)).join('\n'));
