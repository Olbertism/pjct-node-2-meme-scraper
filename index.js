import * as https from 'https';
import * as jsdom from 'jsdom';

const { JSDOM } = jsdom;

const options = {
  host: 'memegen-link-examples-upleveled.netlify.app',
  path: '',
  imgAmount: 10
};

function setupDOM(stringData) {
  return new JSDOM(stringData)
}

function filterIMGAdressArray(dom, amount) {
  const adressArray = [];
  const imgCollection = dom.window.document.getElementsByTagName("img");
  for (let i = 0; i < amount; i++) {
    adressArray.push(imgCollection[i].src)
  }
  console.log(adressArray);
  return adressArray
}


https.request(options, (response) => {
  let rawData = '';

  response.on('data', (chunk) => {
    rawData += chunk;
  });

  response.on('end', () => {
    console.log(rawData)
    const dom = setupDOM(rawData);
    filterIMGAdressArray(dom, options.imgAmount);
  })
}).end();
