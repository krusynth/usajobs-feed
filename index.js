#!/usr/bin/env node

const path = require('path');
require('dotenv').config({path: path.join(path.dirname(__filename), '.env')})

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