# usajobs-feed
Script to pull recent jobs from usajobs and output a YAML file (for use in Jekyll)

## Installation

Download the repo per usual. Run `npm install` to install the dependencies needed.

Make a copy of `.env-example` and name it `.env`. Add your [USAJobs API credentials](https://developer.usajobs.gov/APIRequest/) to this file.

## Usage

`node index.json`

Alternatively, you can also install the script globally with `npm link` and then run `execute usajobs-feed`