import puppeteer, { Page } from "puppeteer";
import { EVENTS_SELECTOR, LINKS, SUBPAGE } from "./constants";
import { writeFile } from "fs/promises";

const data = [];

const scrapeEventoryWebsite = async (url: string, page: Page) => {
  const finalUrl = url + SUBPAGE;
  console.log(finalUrl);

  await page.goto(url + SUBPAGE);
  await page.waitForNetworkIdle();

  const eventInfo = await page.$eval(".event-info", (event) => {
    const info = event.querySelector("div");
    const textNodes = Array.from(info?.childNodes || [])
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent?.trim())
      .filter((text) => text?.length || 0 > 0);

    const [date, venue, location] = textNodes;
    return { date, venue, location };
  });

  const events = await page.$$eval(EVENTS_SELECTOR, (events) => {
    return events.map((e) => {
      const LEVELS = {
        BEGINNER: "Podstawowy / Beginner",
        INTERMEDIETE: "Średnio zaawansowany / Intermediate",
        ADVANCED: "Zaawansowany / Advanced",
      };

      const title = e.querySelector(".trackitem-title")?.textContent;
      const author = e.querySelector(".speaker")?.textContent;
      const description = e.querySelector(
        ".trackitem-description",
      )?.textContent;
      const time = e.querySelector(".trackitem-duration")?.textContent;

      const level = Object.values(LEVELS).find((level) => {
        const regex = new RegExp(level, "gi");
        return description?.toString().match(regex) || "Not found";
      });

      return {
        title,
        author,
        description,
        level,
        time,
      };
    });
  });

  const eventsCombined = events.map((e) => {
    return { ...eventInfo, ...e, finalUrl };
  });

  return eventsCombined;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  const timeout = 5000;
  page.setDefaultTimeout(timeout);

  await page.setViewport({
    width: 1423,
    height: 810,
  });

  for (const link of LINKS) {
    const events = await scrapeEventoryWebsite(link, page);

    data.push(...events);
  }

  await writeFile("4dev-output.json", JSON.stringify(data));
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
