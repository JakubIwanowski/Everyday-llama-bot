const fs = require('fs');
const path = require('path');
const getNumOfPages = (totalItems, itemsPerPage) => {
    let numberOfPages = Math.ceil(totalItems / itemsPerPage);
    return numberOfPages;
}
const getFileName = async (directory) => {
    const file  = fs.readdirSync(directory);
    const filePath = path.join(directory,file[0])
    return filePath;
}
module.exports = { getFileName, getNumOfPages }