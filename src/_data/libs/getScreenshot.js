import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

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

export async function getScreenshot(url) {
    console.log(url);
    const browser = await puppeteer.launch({
        args: args,
        executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar'),
        headless: true
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle2'] });
    //page.setViewport({ width: 1920, height: 1080 });
    const screen = await page.screenshot({ encoding: "base64" });

    await browser.close();

    return screen;
};