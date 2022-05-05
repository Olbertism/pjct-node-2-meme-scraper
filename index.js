import https from 'node:https';
import fs from 'node:fs';
import jsdom from 'jsdom';

const { JSDOM: jsDom } = jsdom;

const options = {
  host: 'memegen-link-examples-upleveled.netlify.app',
  path: '',
  imgAmount: 10,
};

function setupDOM(stringData) {
  return new jsDom(stringData);
}

function filterIMGAdressArray(dom, amount) {
  const adressArray = [];
  const imgCollection = dom.window.document.getElementsByTagName('img');
  for (let i = 0; i < amount; i++) {
    adressArray.push(imgCollection[i].src);
  }
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

function requestAndSaveImage(reqOptions) {
  https
    .request(reqOptions, (response) => {
      const chunks = [];

      console.log(
        'Received response with Status Code ' +
          response.statusCode +
          ' for picture ' +
          reqOptions.outputPath.slice(8),
      );

      response.on('error', (error) => {
        console.log(error);
      });

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFile(reqOptions.outputPath, buffer, (error) => {
          if (error) {
            throw error;
          } else {
            console.log('Saving picture ' + reqOptions.outputPath.slice(8));
          }
        });
      });
    })
    .end();
}

function batchRequestPics(adressList) {
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
    requestAndSaveImage(imgOptions);
    count++;
  }
}

// text param needs to be an array with strings
function generateMeme(templates, id, text) {
  if (templates.some((entry) => entry.id === id)) {
    console.log('Meme template exists....');
    const requestBody = JSON.stringify({
      style: ['string'],
      text: text,
      font: 'string',
      extension: 'string',
      redirect: true,
    });
    const url = new URL('https://api.memegen.link/templates/' + id);
    const generatorOptions = {
      host: url.host,
      path: url.pathname,
      protocol: url.protocol,
      request: requestBody,
      method: 'POST',
    };

    const request = https.request(generatorOptions, (response) => {
      response.on('data', (chunk) => {
        // This part still confuses me...
        process.stdout.write(chunk);
      });

      response.on('end', () => {
        console.log('Requesting download from: ' + response.headers.location);
        const apiUrl = new URL(response.headers.location);
        const imgOptions = {
          host: apiUrl.host,
          protocol: apiUrl.protocol,
          path: apiUrl.pathname,
          method: 'GET',
          outputPath: './memes/custom.jpg',
        };
        requestAndSaveImage(imgOptions);
      });
    });

    request.write(generatorOptions.request);

    request.end();
  } else {
    console.log('Meme template does not exist, aborting...');
    return;
  }
}

function parseCLIText() {
  let upperText = '';
  let lowerText = '';
  if (process.argv[3]) {
    upperText = process.argv[3].split('-').join(' ');
  }
  if (process.argv[4]) {
    lowerText = process.argv[4].split('-').join(' ');
  }
  return [upperText, lowerText];
}

if (process.argv[2]) {
  console.log('Generating custom meme...');
  const templatesURL = 'https://api.memegen.link/templates';
  https
    .request(templatesURL, (response) => {
      let rawData = '';

      response.on('data', (chunk) => {
        rawData += chunk;
      });

      response.on('end', () => {
        const templates = JSON.parse(rawData);
        createOutputFolder();
        generateMeme(templates, process.argv[2], parseCLIText());
      });
    })
    .end();
} else {
  https
    .request(options, (response) => {
      let rawData = '';

      response.on('data', (chunk) => {
        rawData += chunk;
      });

      response.on('end', () => {
        const dom = setupDOM(rawData);
        const imgAdresses = filterIMGAdressArray(dom, options.imgAmount);
        createOutputFolder();
        batchRequestPics(imgAdresses);
      });
    })
    .end();
}
