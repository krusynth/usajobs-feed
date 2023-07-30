# usajobs-feed
Script to pull recent jobs from usajobs. Running the script will print out a list of jobs it has found since you last ran the script. It will also write a YAML file with *all* of the jobs that it found (even the ones that were present the last time your ran the script).

## Upgrade Notes

Upgrading from version 1.0 to 1.1 introduces a breaking change with the addition of the "source" field to the yaml file. To avoid having duplicate entries, remove the previous yaml file before running the updated script! Unfortunately, this will also list *all* entries as *new* in the output of the script.

## Installation

Download the repo per usual. Run `npm install` to install the dependencies needed.

Make a copy of `.env-example` and name it `.env`. Add your [USAJobs API credentials](https://developer.usajobs.gov/APIRequest/) to this file.

## Configuration

The agencies.json file contains agencies that will be included in search results. The provided file excludes intelligence community, defense, and law enforcement agencies: DOD, Justice, and DHS (except for CISA and FEMA).

TODO: update index.js with an option to regenerate this file using the provided `Main.writeAgencies` function.

The jobcodes.json file contains the job codes that will be included in the search results. The provided file includes 2210 Information Technology Management, 1550 Computer Science, and 1560 Data Science.

## Usage

`node index.json`

Alternatively, you can also install the script globally with `npm link` and then run `execute usajobs-feed`