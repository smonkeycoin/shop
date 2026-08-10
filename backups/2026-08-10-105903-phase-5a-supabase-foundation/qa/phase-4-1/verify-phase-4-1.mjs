import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : undefined,
);
const errors = [];

async function stabilize(page) {
  await page.waitForTimeout(900);
  await page.evaluate(async () => {
    const step = Math.max(360, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 180));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

async function check(pathname, viewport, label) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded", timeout: 18000 });
  await stabilize(page);

  const status = response?.status() ?? 0;
  if (status >= 400) errors.push(`${label} ${pathname}: HTTP ${status}`);

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
      new Promise((resolve) => window.setTimeout(resolve, 6000)),
    ]);

    return images
      .filter((image) => image.complete && (!image.currentSrc || image.naturalWidth === 0 || image.naturalHeight === 0))
      .map((image) => image.getAttribute("src") ?? image.currentSrc ?? "(empty)");
  });
  if (brokenImages.length) errors.push(`${label} ${pathname}: broken images ${brokenImages.join(", ")}`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (overflow) errors.push(`${label} ${pathname}: horizontal overflow`);

  if (consoleErrors.length) errors.push(`${label} ${pathname}: console ${consoleErrors.join(" | ")}`);
  await page.close();
}

const desktop = { width: 1440, height: 1200 };
const mobile390 = { width: 390, height: 844 };
const mobile430 = { width: 430, height: 932 };

for (const pathname of ["/", "/productos", "/productos/vortex-camara-espaciadora", "/kits", "/marcas", "/checkout"]) {
  await check(pathname, desktop, "desktop");
  await check(pathname, mobile390, "mobile390");
}
await check("/pedido/NP-2024-0001", mobile430, "mobile430");
await check("/dev/assets", desktop, "desktop");

const kitsPage = await browser.newPage({ viewport: desktop, deviceScaleFactor: 1 });
await kitsPage.goto(`${baseUrl}/kits`, { waitUntil: "domcontentloaded", timeout: 18000 });
await stabilize(kitsPage);
const kitSkuVisible = await kitsPage.locator(".bundle-image, .bundle-detail-image").evaluateAll((nodes) =>
  nodes.some((node) => /\bSKU\b/i.test(node.textContent ?? "")),
);
if (kitSkuVisible) errors.push("/kits: visible SKU placeholder in kit visuals");
await kitsPage.close();

const brandsPage = await browser.newPage({ viewport: desktop, deviceScaleFactor: 1 });
await brandsPage.goto(`${baseUrl}/marcas`, { waitUntil: "domcontentloaded", timeout: 18000 });
await stabilize(brandsPage);
const hiddenBrandVisible = await brandsPage.locator("body").evaluate((body) =>
  ["VORTEX", "Flow-Meter", "NeumoPractice"].some((name) => body.innerText.includes(name)),
);
if (hiddenBrandVisible) errors.push("/marcas: hidden/doubtful brand visible");
await brandsPage.close();

const screenshots = [
  ["/", desktop, "qa/phase-4-1/home-desktop.png"],
  ["/", mobile390, "qa/phase-4-1/home-mobile.png"],
  ["/kits", desktop, "qa/phase-4-1/kits-desktop.png"],
  ["/productos", mobile390, "qa/phase-4-1/products-mobile.png"],
  ["/dev/assets", desktop, "qa/phase-4-1/dev-assets.png"],
];
for (const [pathname, viewport, path] of screenshots) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded", timeout: 18000 });
  await stabilize(page);
  await page.addStyleTag({ content: ".utility-bar,.site-header{position:static!important;top:auto!important;}" });
  await page.screenshot({ path, fullPage: true });
  await page.close();
}

await browser.close();

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("QA PASS phase 4.1 desktop/mobile routes and screenshots");
