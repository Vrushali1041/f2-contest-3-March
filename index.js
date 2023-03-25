const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
const browser = await puppeteer.launch({headless: true});
const page = await browser.newPage();
await page.goto('https://github.com/trending');
const html = await page.content();
const $ = cheerio.load(html);

const repos = [];
const devs = [];

$('.Box-row').each((i, el) => {
const titleEl = $(el).find('h1 a');
const url = 'https://github.com' + titleEl.attr('href');
const title = titleEl.text().trim();
const desc = $(el).find('p.my-1').text().trim();
const lang = $(el).find('span.d-inline-block span:last-child').text().trim();
const stars = $(el).find('a.muted-link svg.octicon-star + span').text().trim();
const forks = $(el).find('a.muted-link svg.octicon-repo-forked + span').text().trim();


const repo = {
  title,
  desc,
  url,
  lang,
  stars,
  forks
}

repos.push(repo);
});

await page.click('a[href="/trending/developers"]');
await page.waitForSelector('.explore-pjax-container .col-md-9 .text-gray');

const devHtml = await page.content();
const $2 = cheerio.load(devHtml);

$2('.explore-content .border-bottom').each((i, el) => {
const name = $(el).find('h2 a').text().trim();
const username = $(el).find('h2 .text-gray').text().trim();
const repoName = $(el).find('.col-md-9 .text-gray a:first-child').text().trim();
const repoDesc = $(el).find('.col-md-9 .text-gray p').text().trim();


const dev = {
  name,
  username,
  repo: {
    name: repoName,
    desc: repoDesc
  }
}

devs.push(dev);
});

const data = {
trending_repos: repos,
trending_devs: devs
}

fs.writeFileSync('data.json', JSON.stringify(data));

console.log(data);

await browser.close();
})();