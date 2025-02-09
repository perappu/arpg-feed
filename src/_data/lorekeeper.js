import { parseFeed } from '@rowanmanning/feed-parser';
import { DateTime } from 'luxon';
import {JSDOM} from "jsdom"
import feeds from "./urls.json" with { type: "json" };

global.DOMParser = new JSDOM().window.DOMParser;

function removeHTMLTags(html) {
    const doc = new global.DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function normalizeItem(item, feed) {
    return {
        'origin' : feed.title,
        'siteUrl' : feed.url,
        'url' : item.url,
        'title' : item.title,
        'date' : item.updated,
        'description' : removeHTMLTags(item.description).substring(0,400)
    }
}

export  async function lorekeeper() {

    const items = [];

    for(let i=0; i<feeds.length; i++) {
        const response = await fetch(feeds[i]);
        const feed = parseFeed(await response.text());
        feed.items.forEach(f => {
            items.push(normalizeItem(f, feed));
        });
	}

    items.sort((a, b) => (new Date(b.date)) - (new Date(a.date)));

	return items;
	
};