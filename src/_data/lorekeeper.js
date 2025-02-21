import { parseFeed } from '@rowanmanning/feed-parser';
import {JSDOM} from "jsdom";
import { Cluster } from 'puppeteer-cluster';
import * as fs from 'node:fs';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

chromium.setGraphicsMode = false;

const args = [
    // '--user-data-dir=./tmp', // enable to run locally and disable the below
    '--user-data-dir=/home/moif/storage', // created in index.js, guess cache folder ends up inside too.
    "--single-process", // Disable to run locally
    "--no-sandbox",
    "--disable-gpu",
    "--disable-setuid-sandbox",
    "--no-first-run",
    '--headless',
    '--hide-scrollbars',
    '--mute-audio',
    '--disable-gl-drawing-for-tests',
    '--disable-canvas-aa', // Disable antialiasing on 2d canvas
    '--disable-2d-canvas-clip-aa', // Disable antialiasing on 2d canvas clips
    '--disable-dev-shm-usage', // ???
    '--no-zygote', // wtf does that mean ?
    '--disable-webgl',
    '--disable-infobars',
    '--disable-breakpad',
    '--deterministic-fetch',
    '--aggressive-cache-discard',
    '--disable-cache',
    '--disable-application-cache',
    '--disable-offline-load-stale-cache',
    '--disable-gpu-shader-disk-cache',
    '--media-cache-size=0',
    '--disk-cache-size=0',
    '--disable-extensions',
    '--disable-component-extensions-with-background-pages',
    '--disable-default-apps',
    '--no-default-browser-check',
    '--autoplay-policy=user-gesture-required',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-notifications',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-domain-reliability',
    '--disable-sync',
    '--disable-stack-profiler',
    '--disable-features=PersistentHistograms'
  ];

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

    const browser = await puppeteer.launch({
        args: args,
        executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar'),
        headless: true
    });

    //items.forEach(async item => {
        const page = await browser.newPage();
        await page.goto(items[0]['url'], { waitUntil: ['domcontentloaded', 'networkidle2'] });
       //page.setViewport({ width: 1920, height: 1080 });
       const screen = await page.screenshot({ encoding: "base64" });
        screenshots.push(screen);
    //});

    await browser.close();

    screenshots.forEach(function(screen, i) {
        items[i-1]['screenshot'] = screen;
    });

    items.sort((a, b) => (new Date(b.date)) - (new Date(a.date)));

    return items;

};