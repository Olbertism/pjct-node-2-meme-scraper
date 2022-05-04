import * as https from 'https';
import * as fs from 'fs';
import * as jsdom from 'jsdom';

const { JSDOM } = jsdom;

const options = {
  host: 'memegen-link-examples-upleveled.netlify.app',
  path: '',
  imgAmount: 10,
};

function setupDOM(stringData) {
  return new JSDOM(stringData);
}

function filterIMGAdressArray(dom, amount) {
  const adressArray = [];
  const imgCollection = dom.window.document.getElementsByTagName('img');
  for (let i = 0; i < amount; i++) {
    adressArray.push(imgCollection[i].src);
  }
  console.log(adressArray);
  return adressArray;
}

function createOutputFolder() {
  const folderName = 'memes';
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }
  return;
}

function saveIMG(adressList) {
  createOutputFolder();

  let count = 1;

  for (const img of adressList) {
    const imgURL = new URL(img);
    const imgOptions = {
      host: imgURL.host,
      protocol: imgURL.protocol,
      path: imgURL.pathname,
      method: 'GET',
      outputPath: './memes/0' + count + '.jpg',
    };
    console.log(imgOptions);

    https
      .request(imgOptions, (response) => {
        const chunks = [];

        console.log(response.statusCode);
        console.log(response.href);

        response.on('error', (error) => {
          console.log(error);
        });

        response.on('data', (chunk) => {
          chunks.push(chunk);
        });

        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          fs.writeFile(imgOptions.outputPath, buffer, (error) => {
            if (error) {
              throw error;
            } else {
              console.log('saved something...');
            }
          });
        });
      })
      .end();
    count++;
  }
}

https
  .request(options, (response) => {
    let rawData = '';

    response.on('data', (chunk) => {
      rawData += chunk;
    });

    response.on('end', () => {
      console.log(rawData);
      const dom = setupDOM(rawData);
      const imgAdresses = filterIMGAdressArray(dom, options.imgAmount);
      saveIMG(imgAdresses);
    });
  })
  .end();
