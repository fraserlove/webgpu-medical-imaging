import * as  _ from 'lodash';
import { decode, encode, RawImageData, BufferLike } from 'jpeg-js';

const axios = require('axios').default;

async function getImage(url) {
  (document.getElementById('inputimg') as HTMLImageElement).src = 'http://localhost:1708/image0.jpeg';
  const response = await axios.get(url,  { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, "utf-8");
  const decoded = decode(buffer as ArrayBuffer);
  
  processImage(new Uint8Array(decoded.data), decoded.width, decoded.height). then(result => {

    // ENCODE TO JPEG DATA
    const resultImage: RawImageData<BufferLike> = {
      width: decoded.width,
      height: decoded.height,
      data: result
    }
    const encoded = encode(resultImage, 100)

    // AS DATA URL
    let binary = '';
    var bytes = new Uint8Array(encoded.data);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    let processed = 'data: image/jpeg;base64,'
    processed += window.btoa(binary);

    // ASSIGN DATA URL TO OUTPUT IMAGE ELEMENT
    (document.getElementById('outputimg') as HTMLImageElement).src = processed;
  });
}

function processImage (array: Uint8Array, width: number, height: number) : Promise<Uint8Array> {
  return new Promise(resolve => {
    // TODO
    resolve(array);
  });
}

const url = 'http://localhost:1708/image0.jpeg';
getImage(url);