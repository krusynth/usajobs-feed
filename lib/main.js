const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const USAJobs = require('./usajobs.js');

class Main {
  grades;
  usajobs;
  jobsFile = './usajobs.yml';

  constructor() {
    this.grades = this.readGrades();
    this.usajobs = new USAJobs({grades: this.grades});

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
    // 2210 Information Technology Management
    // 0343 Management And Program Analysis
    // 0301 Miscellaneous Administration And Program  CDO
    // 1001 General Arts And Information
    // 1550 Computer Science

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

  compareJobs(newJobs) {
    let oldJobs = this.readJobs();
    let oldJobIds = oldJobs.map(job => job.id);

    console.log('------------------ New Jobs ------------------ ');

    // Rather than just replacing-in-place the old jobs with the new ones, we instead merge the two
    // lists. This preserves any custom data or non-usajobs that may have been added to the file.

    let mergedJobs = oldJobs;
    let newJobIds = [];

    for(const key in newJobs) {
      const newJob = newJobs[key];
      if(!oldJobIds.includes(newJob.id)) {
        console.log(newJob);
        mergedJobs.unshift(newJob);
      }

      newJobIds.push(newJob.id);
    }

    // Remove old jobs which have disappeared from the newjobs list, for this same source only.

    for(const key in mergedJobs) {
      if(!newJobIds.includes(mergedJobs[key].id) && mergedJobs[key].source == this.usajobs.source) {
        // console.log('Removed ' + mergedJobs[key].id);
        mergedJobs.splice(key, 1);
      }
    }

    return mergedJobs;
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

  readGrades() {
    let grades = JSON.parse(fs.readFileSync(path.join(path.dirname(__filename), '../grades.json')));

    return grades;
  }
}

module.exports = Main;