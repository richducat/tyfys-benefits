const fs = require("fs");
const path = require("path");
const manifest = require("./seo-manifest.cjs");

const ROOT = path.resolve(__dirname, "..");
const { SITE_URL, pages } = manifest;
const pageFiles = Object.keys(pages);

function absoluteUrl(canonicalPath) {
  return new URL(canonicalPath === "/" ? "/" : canonicalPath, `${SITE_URL}/`).toString();
}

function matchAll(html, regex) {
  const matches = [];
  let match;
  while ((match = regex.exec(html))) {
    matches.push(match);
  }
  return matches;
}

const issues = [];
const indexableTitles = new Map();
const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const sitemapUrls = new Set(matchAll(sitemap, /<loc>(.*?)<\/loc>/g).map((match) => match[1]));

for (const filename of pageFiles) {
  const entry = pages[filename];
  const html = fs.readFileSync(path.join(ROOT, filename), "utf8");
  const titleMatches = matchAll(html, /<title[^>]*>[\s\S]*?<\/title>/gi);
  const descriptionMatches = matchAll(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["'][^"']*["'][^>]*>/gi,
  );
  const canonicalMatches = matchAll(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/gi,
  );
  const h1Matches = matchAll(html, /<h1\b[^>]*>[\s\S]*?<\/h1>/gi);
  const robotsMatch = html.match(
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );

  if (titleMatches.length !== 1) {
    issues.push(`${filename}: expected 1 <title>, found ${titleMatches.length}`);
  }

  if (descriptionMatches.length !== 1) {
    issues.push(`${filename}: expected 1 meta description, found ${descriptionMatches.length}`);
  }

  if (canonicalMatches.length !== 1) {
    issues.push(`${filename}: expected 1 canonical link, found ${canonicalMatches.length}`);
  } else {
    const expectedCanonical = absoluteUrl(entry.redirectTarget || entry.canonicalPath);
    if (canonicalMatches[0][1] !== expectedCanonical) {
      issues.push(
        `${filename}: canonical mismatch (${canonicalMatches[0][1]} !== ${expectedCanonical})`,
      );
    }
  }

  if (entry.indexable && h1Matches.length !== 1) {
    issues.push(`${filename}: expected 1 visible <h1>, found ${h1Matches.length}`);
  }

  if (!robotsMatch) {
    issues.push(`${filename}: missing robots meta tag`);
  } else if (entry.noindex && !/noindex/i.test(robotsMatch[1])) {
    issues.push(`${filename}: expected noindex robots tag`);
  } else if (entry.indexable && !/index/i.test(robotsMatch[1])) {
    issues.push(`${filename}: expected index robots tag`);
  }

  if (entry.indexable) {
    const titleText = titleMatches[0] ? titleMatches[0][0].replace(/<[^>]+>/g, "").trim() : filename;
    if (indexableTitles.has(titleText)) {
      issues.push(`${filename}: duplicate indexable title also used by ${indexableTitles.get(titleText)}`);
    } else {
      indexableTitles.set(titleText, filename);
    }

    const canonicalUrl = absoluteUrl(entry.canonicalPath);
    if (!sitemapUrls.has(canonicalUrl)) {
      issues.push(`${filename}: missing from sitemap`);
    }
  } else if (sitemapUrls.has(absoluteUrl(entry.canonicalPath))) {
    issues.push(`${filename}: noindex page should not be in sitemap`);
  }
}

const manifestCoverage = fs
  .readdirSync(ROOT)
  .filter((name) => name.endsWith(".html"))
  .sort();

for (const filename of manifestCoverage) {
  if (!pages[filename]) {
    issues.push(`${filename}: missing manifest entry`);
  }
}

if (issues.length) {
  console.error("SEO checks failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(`SEO checks passed for ${pageFiles.length} pages.`);
