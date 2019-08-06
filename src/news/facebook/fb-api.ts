import axios from 'axios';
import cheerio from 'cheerio';

import chrono from 'chrono-node/src/chrono';

function parsePostContent(contentString: string): {title: string; content: string} {
    let title = '';
    let content = contentString;

    const matches = contentString.match(/\[(.*?)\]/);

    if (matches) {
        title = matches[1];
    }

    content = content.replace(`[${title}]`, '').trim();

    return { title, content }
}

function parseFacebookDate(dateString: string) {
    const parsedDate: Date = chrono.parseDate(dateString);

    return parsedDate;
}

async function getPageHTML(pageId: string) {
    const res = await axios.get('https://mobile.facebook.com/' + pageId, {
        transformResponse: [(data) => { return data; }],
        headers: {
            'Accept-Language': 'en;q=0.5'
        }
    });

    return res.data;
}

function extractLink(document: Cheerio) {
    return document.find('a:contains("Full Story")').attr('href');
}

export async function getPagePosts(pageId: string) {
    const pageHTML = await getPageHTML(pageId);
    const $ = cheerio.load(pageHTML);

    const posts: {title: string; content: string; link: string, date: Date}[] = [];

    const postEls = $('#recent > div:nth-child(1) > div:nth-child(1) > div');
    postEls.each((i, el) => {
        const content = $(el).find('div:nth-child(1) > div:nth-child(2) > span').text();
        const link = extractLink($(el));
        const date = $(el).find('div:nth-child(1) abbr').text();

        posts.push({ ...parsePostContent(content), link, date: parseFacebookDate(date) });
    });

    return posts;
}
