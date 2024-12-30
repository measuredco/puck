import puppeteer from "puppeteer";

export const setup = async (
  url = "http://localhost:3000/test/edit?disableIframe=false",
  { headless = true, ...options } = {}
) => {
  const browser = await puppeteer.launch({ headless, ...options });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 812 });
  await page.goto(url);

  return { browser, page };
};
