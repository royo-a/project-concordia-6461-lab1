import * as net from 'net';
import { parse } from 'path';

const parseURL = (url) => {
  let urlParts = {};

  // First strip the 'http://' from the url
  url = url.replace(/http:\/\//gi, '');
  // Separate the host, port and the path
  // TODO: test this part
  let indexOfSlash = url.search(/\//);
  indexOfSlash = indexOfSlash === -1 ? url.length : indexOfSlash;
  let [hostWithPort, path] = [
    url.slice(0, indexOfSlash),
    url.slice(indexOfSlash + 1),
  ];

  let [host, port] = hostWithPort.split(':');
  urlParts.host = host;
  urlParts.port = port ? Number.parseInt(port) : 80;
  urlParts.path = path;

  return urlParts;
};

/**
 *
 * @param {string} url - The URL to send the request to.
 * @param {string[]} headers - An array of strings representing headers in "key:value" pair.
 * @returns string - The data sent from the server.
 */
const httpGET = (url, headers = []) => {
  // Parse the url into host, port and path.
  let { host, port, path } = parseURL(url);

  // Prepare the GET request string
  let request = `GET /${path} HTTP/1.0\r\n`;
  // Add the headers to request string
  headers.forEach((header) => {
    request += header + '\r\n';
  });
  request += '\r\n';

  // Create connection with host. A socket is returned.
  let socket = net.createConnection(port, host);

  // When connection is established, send GET request.
  socket.on('connect', () => {
    socket.write(request);
  });

  // When the server sends the data in streams, append the data to a variable.
  let data = '';
  socket.on('data', (res) => {
    data += res.toString();
  });

  // If socket remains idle for 3s, trigger a timeout event.
  socket.setTimeout(5000);

  // Close the connection by terminating the socket.
  socket.on('timeout', () => {
    // Sends a FIN packet to the server. When the server sends a FIN packet back, closes the connection.
    socket.end();
  });

  // Return the data when the socket gets terminated.
  return new Promise((resolve, reject) => {
    socket.on('close', () => {
      resolve(data);
    });
    socket.on('error', () => {
      reject('An error occured with the socket. Closing the connection.');
    });
  });
};

/**
 *
 * @param {string} url - The URL to send the request to.
 * @param {string} uploadData - The data to upload to the server.
 * @param {string[]} headers - An array of strings representing headers in "key:value" pair.
 */
const httpPOST = (url, uploadData, headers) => {
  // Parse the url into host, port and path.
  let { host, port, path } = parseURL(url);

  // Prepare the POST request string
  let request =
    `POST /${path} HTTP/1.0\r\n` + `Content-Length: ${uploadData.length}\r\n`;
  // Add the headers to request string
  headers.forEach((header) => {
    request += header + '\r\n';
  });
  request += '\r\n';
  request += uploadData;

  // Create connection with host. A socket is returned.
  let socket = net.createConnection(port, host);

  // When connection is established, send POST request.
  socket.on('connect', () => {
    socket.write(request);
  });

  // When the server sends the data in streams, append the data to a variable.
  let data = '';
  socket.on('data', (res) => {
    data += res.toString();
  });

  // If socket remains idle for 3s, trigger a timeout event.
  socket.setTimeout(3000);

  // Close the connection by terminating the socket.
  socket.on('timeout', () => {
    // Sends a FIN packet to the server. When the server sends a FIN packet back, closes the connection.
    socket.end();
  });

  // Return the data when the socket gets terminated.
  return new Promise((resolve, reject) => {
    socket.on('close', () => {
      resolve(data);
    });
    socket.on('error', () => {
      reject('An error occured with the socket. Closing the connection.');
    });
  });
};

// httpGET('http://httpbin.org/get?course=networking&assignment=1', [
//   'Host:httpbin.org',
// ])
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((error) => {
//     console.log(error);
//   });

// httpPOST('http://httpbin.org/post', '{"name":"John"}', [
//   'Host: httpbin.org',
//   'Content-Type: application/json'
// ])
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((error) => {
//     console.log(error);
//   });

export { httpGET, httpPOST };
