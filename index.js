require('dotenv').config()

const Main = require('./lib/main.js');

let main = new Main();
main.getJobs()
.then(jobs => {
  main.compareJobs(jobs);
  main.writeJobs(jobs);

  console.log('done');
  // console.log(data['SearchResult']['SearchResultItems']);
})
.catch(error => {
  console.log(error);
});