
const http = require('http')
const concatStream = require('concat-stream');

const url = process.argv[2];
// console.log(url);

http.get(url, res => {
  res.pipe(concatStream(function (data) {
    console.log(data.length);
    console.log(data.toString());
  }))
});
