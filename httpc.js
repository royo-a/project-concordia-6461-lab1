import { createInterface } from 'readline';

const httpcGetRegex = /httpc get( -v)?( -h [a-z-]+:[a-z-]+)* (.)+/ig;
const httpcPostRegex = /httpc post( -v)?( -h [a-z-]+:[^\s]+)* ((-d '.+')|(-f .+\.txt)) (.)+/ig;
const urlRegex = /(https?|ftp):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/ig;

let rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'httpc > ',
});

rl.on('line', (line)=>{ 
  
 })

rl.on('close', ()=>{ 
  console.log('...exit...\r\nHave a good day!');
 })

rl.prompt();