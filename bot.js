require('dotenv').config()
const { getFileName } = require("./utilities");
const Mastodon = require('./mastodon');
const PixaBay = require('./photo');
const path = require('path')
const fs = require('fs');
const cron = require('node-cron');
console.log('Frolicking...');
const directory = 'temp';
const paramsObject = {
    key: process.env.PIXABAY_API_KEY,
    q: 'llama',
    image_type: 'photo',
    category: 'animals',
    safesearch: true,
    per_page: 20,
}
const PixaBayClient = new PixaBay(paramsObject);




const config = {
    token: process.env.MASTODON_TOKEN,
    baseUrl: 'botsin.space'
}
const MastodonClient = new Mastodon(config);

const init = async () => {
const { pageURL } = await PixaBayClient.getPhoto(directory);
const filePath = await getFileName(directory);
MastodonClient.uploadMedia(filePath, pageURL)
}
MastodonClient.listen('user:notification')
cron.schedule('0 8 * * *', () => {
    init()
  }, {
    timezone: "Europe/Warsaw"
  });