import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

const getScreenshot = async (url) => {
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

module.exports = getScreenshot;