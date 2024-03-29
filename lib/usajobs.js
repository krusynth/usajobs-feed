const https = require('https');

class USAJobs {
  host = 'data.usajobs.gov';
  recently = 14; // Number of days to pick up posts beginning from.
  source = 'usajobs';
  grades = {};

  constructor(args) {
    this.grades = args.grades;
  }

  async jobs(criteria) {
    let path = '/api/search';

    if(criteria) {
      const query = new URLSearchParams(criteria);
      path += '?' + query.toString();
    }

    const result = await this._fetch(path);
    let jobs = [];

    if(result.SearchResult && result.SearchResult.SearchResultItems) {
      let recent = new Date();
      recent.setDate(recent.getDate() - this.recently);
      for(const post of result.SearchResult.SearchResultItems) {

        let postdate = new Date(post.MatchedObjectDescriptor.PublicationStartDate);
        let closedate = new Date(post.MatchedObjectDescriptor.ApplicationCloseDate);

        if(postdate > recent) {

          let agency = post.MatchedObjectDescriptor.DepartmentName + ' - ' +
            post.MatchedObjectDescriptor.OrganizationName;

          if(post.MatchedObjectDescriptor.DepartmentName ==
              'Other Agencies and Independent Organizations'
          ) {
            agency = post.MatchedObjectDescriptor.OrganizationName;
          }

          let gradeCat = post.MatchedObjectDescriptor.JobGrade[0].Code;
          let lowGrade = post.MatchedObjectDescriptor.UserArea.Details.LowGrade;
          let highGrade = post.MatchedObjectDescriptor.UserArea.Details.HighGrade;

          let job = {
            id: post.MatchedObjectId,
            posted: post.MatchedObjectDescriptor.PublicationStartDate,
            closes: post.MatchedObjectDescriptor.ApplicationCloseDate,
            agency: agency,
            title: post.MatchedObjectDescriptor.PositionTitle,
            lowGrade: `${gradeCat} ${lowGrade}`,
            highGrade: `${gradeCat} ${highGrade}`,
            salaryMin: Math.floor(post.MatchedObjectDescriptor.PositionRemuneration[0].MinimumRange),
            salaryMax: Math.floor(post.MatchedObjectDescriptor.PositionRemuneration[0].MaximumRange),
            url: post.MatchedObjectDescriptor.PositionURI.replace(':443', ''),
            remote: post.MatchedObjectDescriptor.UserArea.Details.RemoteIndicator,
            source: this.source
          }

          if(this.grades[gradeCat]?.special) {
            job.specialPay = true;
            // console.log(this.grades[gradeCat]?.name, 'Special Pay');
          }

          if(this.grades[gradeCat]?.ranges?.[lowGrade]?.equiv) {
            job.lowGradeEquiv = this.grades[gradeCat].ranges[lowGrade].equiv;
            // console.log(gradeCat, lowGrade, 'Low Equivalent:', this.grades[gradeCat].ranges[lowGrade].equiv);
          }

          if(this.grades[gradeCat]?.ranges?.[highGrade]?.equiv) {
            job.highGradeEquiv = this.grades[gradeCat].ranges[highGrade].equiv;
            // console.log(gradeCat, highGrade, 'High Equivalent:', this.grades[gradeCat].ranges[highGrade].equiv);
          }

          jobs.push(job);
        }
      }
    }

    // Reverse sort by id (newest first).
    jobs.sort((a,b) => {
      if(a.id < b.id) {
        return 1;
      }
      else if(a.id > b.id) {
        return -1;
      }
      else {
        return 0;
      }
    });

    return jobs;
  }

  async agencies() {
    const path = '/api/codelist/agencysubelements';
    const result = await this._fetch(path);
    let agencies = {};

    if(result.CodeList) {
      result.CodeList[0].ValidValue.forEach(elm => {
        // Ignore inactive codes
        if(elm.IsDisabled == 'No') {
          agencies[elm.Code] = {
            name: elm.Value,
          };
          if(elm.ParentCode) {
            agencies[elm.Code].parentCode = elm.ParentCode
          }
        }
      });
    }

    return agencies;
  }

  _fetch(path) {
    const options = {
      host: this.host,
      path: path,
      headers: {
        'User-Agent': process.env.USERAGENT,
        'Authorization-Key': process.env.USAJOBS_API_KEY
      }
    }

    // console.log(url);
    return new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data = data + chunk.toString();
        });

        response.on('end', () => {
          try {
            const body = JSON.parse(data);
            resolve(body);
          }
          catch(error) {
            console.log(data);
            reject(error);
          }
        });
      })

      request.on('error', (error) => {
        reject(error);
      });
      request.end();
    });
  }

}

module.exports = USAJobs;