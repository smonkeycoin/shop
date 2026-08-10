import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const routes = [
  "/",
  "/productos",
  "/productos/vortex-camara-espaciadora",
  "/productos/aerochamber-plus-flow-vu",
  "/categorias",
  "/kits",
  "/dev/assets",
  "/dev/catalog",
];

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : undefined,
);
const errors = [];

async function checkRoute(pathname) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(900);
  const status = response?.status() ?? 0;
  if (status >= 400) {
    errors.push(`${pathname}: HTTP ${status}`);
  }

  const brokenImages = await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.race([
      Promise.all(
        images.map((image) =>
          image.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                image.addEventListener("load", resolve, { once: true });
                image.addEventListener("error", resolve, { once: true });
              }),
        ),
      ),
      new Promise((resolve) => window.setTimeout(resolve, 2500)),
    ]);

    return images
      .filter((image) => !image.currentSrc || image.naturalWidth === 0 || image.naturalHeight === 0)
      .map((image) => image.getAttribute("src") ?? image.currentSrc ?? "(empty)");
  });

  if (brokenImages.length > 0) {
    errors.push(`${pathname}: broken images ${brokenImages.join(", ")}`);
  }

  if (consoleErrors.length > 0) {
    errors.push(`${pathname}: console errors ${consoleErrors.join(" | ")}`);
  }

  await page.close();
}

for (const route of routes) {
  await checkRoute(route);
}

const home = await browser.newPage({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 1 });
await home.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
await home.waitForTimeout(1000);
await home.screenshot({ path: "qa/asset-pass/after-home.png", fullPage: true });
const heroProductCount = await home.locator(".hero-product img").count();
if (heroProductCount < 4) {
  errors.push(`/: hero composition expected 4 product images, found ${heroProductCount}`);
}
await home.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 1200 }, deviceScaleFactor: 1 });
await mobile.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
await mobile.waitForTimeout(1000);
await mobile.screenshot({ path: "qa/asset-pass/after-mobile.png", fullPage: true });
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
if (overflow) {
  errors.push("/: mobile horizontal overflow");
}
await mobile.close();

await browser.close();

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`QA PASS ${routes.length} routes, screenshots regenerated`);
