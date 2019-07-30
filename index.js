var JSDOM = require('jsdom').JSDOM;
const argv = require('yargs').argv;
var puppeteer = require('puppeteer');
var Readability = require('Readability');
var unfluff = require('unfluff');
var Mercury = require('@postlight/mercury-parser');


const fetch = async function (url) {
  console.log('Extracting...');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const content = await page.content();
  const doc = new JSDOM(content, {url});

  let readability = new Readability(doc.window.document).parse();
  let unfluffContent = new unfluff(content);
  let mercury = await Mercury.parse(url, {
    html: content
  });

  const keywordsArray = unfluffContent.keywords ? unfluffContent.keywords.split(', ') : [];

  const obj = {
    author: readability.byline,
    title: readability.title,
    article: readability.textContent,
    videos: unfluffContent.videos,
    siteName: readability.siteName,
    publishDate: mercury.date_published,
    image: mercury.lead_image_url,
    url: mercury.url,
    direction: mercury.direction,
    favicon: mercury.favicon,
    word_count: mercury.word_count,
    tags: Array.from(new Set([...unfluffContent.tags, ...keywordsArray])),
    publisher: unfluffContent.publisher
  }
  console.log('unfluffContent', obj);


};


fetch(argv.url);
