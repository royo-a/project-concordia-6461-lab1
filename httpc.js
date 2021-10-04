import { createInterface } from 'readline';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { httpGET, httpPOST } from './http-library.js';

const httpcGetRegex =
  /httpc get( -v)?( -h [a-z-]+:[a-z-]+)* http:\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/gi;
const httpcPostRegex =
  /httpc post( -v)?( -h [a-z-]+:[^\s]+)* ((-d '.+')|(-f .+\.txt)) http:\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/gi;
const httpcHelpRegex = /httpc help( (get|post))?/gi;

// Custom event which triggers when all data is received and processed from the server.
const eventEmitter = new EventEmitter();
eventEmitter.on('dataProcessed', (requestParameters) => {
  httpPOST(
    requestParameters.url,
    requestParameters.data,
    requestParameters.headers
  )
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
});

/**
 * Checks if user input follows correct syntax.
 *
 * @param {string} input - The input from the command line
 * @returns {Boolean} True if the structure is correct
 */
const ifStructureOk = (input) => {
  let matchedString =
    input.match(httpcGetRegex) ||
    input.match(httpcPostRegex) ||
    input.match(httpcHelpRegex);

  return matchedString ? matchedString[0].length === input.length : false;
};

let rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'httpc > ',
});

rl.on('line', (line) => {
  // If input doesn't have correct syntax, show error
  if (!ifStructureOk(line)) {
    console.log(
      'Format error: The command or URL isn\'t correct! For help with command, type "httpc help".'
    );

    rl.prompt();
    return;
  }

  let arrayOfSplitInput = line.split(' ');
  let inputParts = {
    isVerbose: false,
    headers: [],
    fileName: null,
    data: '',
    url: null,
  };

  // TODO: test this part
  // Extract request parameters (verbose, headers, data, url and filename)
  inputParts.url = arrayOfSplitInput[arrayOfSplitInput.length - 1];
  for (let i = 2; i < arrayOfSplitInput.length - 1; i++) {
    if (arrayOfSplitInput[i].toLowerCase() === '-h') {
      inputParts.headers.push(arrayOfSplitInput[i + 1]);
    } else if (arrayOfSplitInput[i].toLowerCase() === '-v') {
      inputParts.isVerbose = true;
    } else if (arrayOfSplitInput[i].toLowerCase() === '-d') {
      inputParts.data = arrayOfSplitInput[i + 1];
    } else if (arrayOfSplitInput[i].toLowerCase() === '-f') {
      inputParts.fileName = arrayOfSplitInput[i + 1];
    }
  }

  // TODO: If input is for 'help', output text for 'help'.
  // Else if, input is for GET, send a GET request.
  // Else send a POST request.
  if (arrayOfSplitInput[1].toLowerCase() === 'help') {
    // If input contains only 'help', show output for help.
    // Else if, input contains help for get, show help for get.
    // Else show help for post.
    if (!arrayOfSplitInput[2]) {
      console.log(
        'httpc is a curl-like application but supports HTTP protocol only.\n' +
          'Usage:\n' +
          '\thttpc command [arguments]\n' +
          'The commands are:\n' +
          '\tget     executes a HTTP GET request and prints the response.\n' +
          '\tpost    executes a HTTP POST request and prints the response.\n' +
          '\thelp    prints this screen.\n' +
          'Use "httpc help [command]" for more information about a command.'
      );
    } else if (arrayOfSplitInput[2] === 'get') {
      console.log(
        'Usage:\n' +
          '\thttpc get [-v] [-h key:value] URL\n' +
          'Get executes a HTTP GET request for a given URL.\n' +
          '\t-v             Prints the detail of the response such as protocol, status and headers.\n' +
          "\t-h key:value   Associates headers to HTTP Request with the format 'key:value'."
      );
    } else {
      console.log(
        'Usage:\n' + 
         '\thttpc post [-v] [-h key:value] [-d inline-data] [-f file] URL\n' +
          'Post executes a HTTP POST request for a given URL with inline data or from file.\n' +
          '\t-v             Prints the detail of the response such as protocol, status, and headers.\n' +
          '\t-h key:value   Associates headers to HTTP Request with the format key:value.\n' +
          '\t-d string      Associates an inline data to the body HTTP POST request.\n' +
          '\t-f file        Associates the content of a file to the body HTTP POST request.\n' +
          'Either [-d] or [-f] can be used but not both.'
      );
    }

    rl.prompt();
  } else if (arrayOfSplitInput[1].toLowerCase() === 'get') {
  } else {
    // If filename is mentioned, import data from file.
    if (inputParts.fileName) {
      const fileReadLine = createInterface({
        input: fs.createReadStream(inputParts.fileName),
        crlfDelay: Infinity,
      });

      fileReadLine.on('line', (line) => {
        inputParts.data += line;
      });

      fileReadLine.on('close', () => {
        eventEmitter.emit('dataProcessed', inputParts);
      });
    } else {
      eventEmitter.emit('dataProcessed', inputParts);
    }
  }
});

rl.on('close', () => {
  console.log('...exit...\r\nHave a good day!');
});

rl.prompt();
