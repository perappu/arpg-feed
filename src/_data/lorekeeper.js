import { parseFeed } from '@rowanmanning/feed-parser';
import { DateTime } from 'luxon';
import { JSDOM } from "jsdom"
import feeds from "./urls.json" with { type: "json" };
import { Cluster } from 'puppeteer-cluster';
import chromium from "@sparticuz/chromium-min";

global.DOMParser = new JSDOM().window.DOMParser;

function removeHTMLTags(html) {
    const doc = new global.DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function normalizeItem(item, feed) {
    return {
        'origin': feed.title,
        // LK doesn't give us the origin url for some reason
        'site': feed.self.split('/')[2],
        'url': item.url,
        'title': item.title,
        'date': item.updated,
        'description': removeHTMLTags(item.description).substring(0, 500)
    }
}

export async function lorekeeper() {

    const items = [];
    const screenshots = [];

    for (let i = 0; i < feeds.length; i++) {
        const response = await fetch(feeds[i]);
        const feed = parseFeed(await response.text());
        feed.items.forEach(f => {
            var item = normalizeItem(f, feed);
            items.push(item);
        });
    }

    const chromiumPack = "https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar";

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2,
        puppeteerOptions: {
            args: chromium.args,
            executablePath: await chromium.executablePath(chromiumPack),
            args: chromium.args,
            headless: false,
        }
    });

    await cluster.task(async ({ page, data: url }) => {
        await page.goto(url);
        page.setViewport({ width: 1920, height: 1080 });
        const screen = await page.screenshot({ encoding: "base64" });
        screenshots.push(screen);
    });

    items.forEach(item => {
        cluster.queue(item['url']);
    });

    await cluster.idle();
    await cluster.close();

    items.forEach(function(item, i) {
        item['screenshot'] = screenshots[i];
    });

    items.sort((a, b) => (new Date(b.date)) - (new Date(a.date)));

    return items;

};