const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const USAJobs = require('./usajobs.js');

class Main {
  usajobs;
  jobsFile = './usajobs.yml';

  constructor() {
    this.usajobs = new USAJobs();

    this.jobsFile = path.join(process.cwd(), this.jobsFile);
  }

  async getJobs() {
    let criteria = {};
    criteria.Organization = Object.keys(this.readAgencies()).join(';');
    criteria.JobCategoryCode = Object.keys(this.readJobCodes()).join(';');
    criteria.PayGradeLow = '12';
    // criteria.DatePosted = '2'; // Doesn't work ???
    criteria.ResultsPerPage = 500;
    // TODO: OR Chief Information Officer OR Chief Data Officer OR Chief Information Security Officer OR Chief Technology Officer OR Chief Innovation Officer OR Product Manager

    criteria.SortField = 'openingdate';
    criteria.SortDirection = 'desc';
    // criteria.WhoMayApply = 'public';
    criteria.HiringPath = 'public';

    let jobs = await this.usajobs.jobs(criteria);

    return jobs;
  }

  writeJobs(jobs) {
    fs.writeFileSync(this.jobsFile, yaml.dump(jobs));

    return jobs;
  }

  readJobs() {
    let oldJobs = [];
    if(fs.existsSync(this.jobsFile)) {
      oldJobs = yaml.load(fs.readFileSync(this.jobsFile));
    }
    return oldJobs;
  }

  compareJobs(jobs) {
    console.log(process.cwd());

    let oldJobIds = this.readJobs().map(job => job.id);

    console.log('------------------ New Jobs ------------------ ');

    for(const id in jobs) {
      if(!oldJobIds.includes(jobs[id].id)) {
        console.log(jobs[id]);
      }
    }

    return jobs;
  }

  writeAgencies(topOnly) {
    this.usajobs.agencies().then(agencies => {
      // console.log(agencies);
      for(const code in agencies) {
        if(topOnly && agencies[code].parentCode) {
          delete agencies[code];
        }
      }
      fs.writeFileSync('agencies.json', JSON.stringify(agencies, null, 2));
    });
  }

  readAgencies() {
    let agencies = JSON.parse(fs.readFileSync(path.join(path.dirname(__filename), '../agencies.json')));

    return agencies;
  }

  readJobCodes() {
    let jobcodes = JSON.parse(fs.readFileSync(path.join(path.dirname(__filename), '../jobcodes.json')));

    return jobcodes;
  }
}

module.exports = Main;