const { getNumOfPages } = require("./utilities");
const { promises } = require('fs');
const fs = require('fs');
const path = require('path');

class PixaBay {
    constructor(params) {
        this.apiParams = params;
        this.searchParams = new URLSearchParams(params);
    }
    async getPages (parameters) {
        console.log('Getting pages...');
        try {
            const response = await fetch('https://pixabay.com/api/?' + parameters);
            if(response.ok) {
                const resJson = await response.json();
                const totalHits = resJson.totalHits;
                const pages = getNumOfPages(totalHits,this.apiParams.per_page);
                console.log('Number of pages:', pages);
                return pages;
            } else {
                return Promise.reject(response); 

            }
        }
        catch(error) {
            console.log(error)
        }
    }
    async getPhoto (directory) {
        console.log('Downloading a llama...');
        const totalPages = await this.getPages(this.searchParams);
        const newParams = new URLSearchParams({
            ...this.apiParams,
            page: Math.floor(Math.random() * (totalPages - 1) + 1)
        })
       return fetch('https://pixabay.com/api/?' + newParams )
        .then((res)=> {
            if(res.ok) {
               return res.json()
            } else {
                return Promise.reject(res); 
            }
        })
        .then(async (res)=> {
            for (const file of await promises.readdir(directory)) {
                await promises.unlink(path.join(directory, file));
              }
            const imageIndex =  Math.floor(Math.random() * res?.hits.length);
            const imageToGet = await res.hits[imageIndex];
            const imgExtension = path.extname(imageToGet.webformatURL)
            const img = await fetch(imageToGet.webformatURL);
            const blob = await img.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await promises.writeFile(`${directory}/llama${imgExtension}`, buffer);
            console.log('We have a new llama!')
            return imageToGet;
    
    })
    .catch(error => console.error(error));
    }
}
module.exports = PixaBay;