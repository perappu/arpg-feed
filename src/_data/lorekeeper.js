import { parseFeed } from '@rowanmanning/feed-parser';
import {JSDOM} from "jsdom";
import puppeteer from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import * as fs from 'node:fs';

const feeds = JSON.parse(fs.readFileSync('./src/_data/urls.json'));

global.DOMParser = new JSDOM().window.DOMParser;

function removeHTMLTags(html) {
    const doc = new global.DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function normalizeItem(item, feed) {
    return {
        'origin' : feed.title,
        // LK doesn't give us the origin url for some reason
        'site' : feed.self.split('/')[2],
        'url' : item.url,
        'title' : item.title,
        'date' : item.updated,
        'description' : removeHTMLTags(item.description).substring(0,400)
    }
}

export  async function lorekeeper() {

    const items = [];
    const screenshots = [];

    for (let i = 0; i < feeds.length; i++) {

        try {
            const response = await fetch(feeds[i]);
            const feed = parseFeed(await response.text());
            feed.items.forEach(f => {
                items.push(normalizeItem(f, feed));
            });
        } catch {
            continue;
        }
    }

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 1,
    });

    await cluster.task(async ({ page, data: url }) => {
        await page.goto(url);
        page.setViewport({ width: 1920, height: 1080 });
        const screen = await page.screenshot({ encoding: "base64" });
        console.log(url);
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