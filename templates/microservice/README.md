TS Microservice Boilerplate (source repo)
=======================================================================

This is a standard Openfinance service. Read about project structure [here](https://docs.openfinance.io/?doc=1C0V8aTSydxCPEVuJABnOUpcpX4vlZU7I) and microservice development [here](https://docs.openfinance.io/?doc=1kHSDibS2d4wcYSNifM8SqbX-K9y3XzNx).

## Settng Up a New Microservice Project

1. Create your -src and dist repos on Github (using this convention: src --> `project-name-src`, dist --> `project-name`)
2. Clone this repo into a folder with your project name using a command like `git clone git@github.com:cfxmarkets/ts-microservice-boilerplate-src project-name-src`. Where `project-name-src` is your newly created src repo.
3. Cd into your new src repo and run `./scripts/setup [project name] [project nickname]`

All together, this might look like the following for a new service called the Auditor Service:

```
# Project Name: auditor-service
# Nickname: auditor
#
# Create github repos auditor-service-src and auditor-service
# then...

cd ~/openfinance
git clone git@github.com:cfxmarkets/ts-microservice-boilerplate-src auditor-service-src
cd audito-service-src
./scripts/setup auditor-service auditor

# Check to make sure everything looks right
git status

# Now commit and push both repos
git add ./
git commit -m ":sparkles:"
cd build
git add ./
git commit -m ":sparkles:"
```


## Development

As with most of our services, this service is written in typescript `^3.0`. You may develop it in the traditional way by just running `npm install` and proceeding as normal.

**Note: This repo uses development libraries like jest and prettier that only work on Node 10 and above. If you get errors when committing or testing, try switching to Node 10 using nvm.**


## Running

To run the official service, install the debian package: `sudo apt-get install [package-name]` (see [Build the Debian Package](#building-the-debian-package) below).

To run the service for testing, you have a few options, all of which start with compiling it (run `tsc` -- this compiles everything into the `dist` directory). Once compiled, you can:

1. adjust local config, if necessary, and run the application in place by running `node ./dist/index.js`;
2. cd into `build` and run the application in place by running `node ../dist/index.js`;
3. build the final bundle by running `npm run build` (which runs webpack to build the files), cd into `build` and run the final app by running `node ./service/app`.

You should always do final testing using method 3, so that you _know_ your build worked as expected.


## Building the Debian Package

This repo uses `peekaygee` (available from [this apt repo](https://packages.kaelshipman.me/)) to facilitate building the deb package. Here are the steps you need to complete to create a successful package:

1. Install `peekaygee` and `peekaygee-builder-deb` (follow the instructions in the link above to add the apt repo, then type `sudo apt-get install -y peekaygee peekaygee-builder-deb`)
2. Update the `pkg-src/VERSION` file to reflect the most recent version of the package (may be a dash version if the underlying app hasn't changed)
3. Run `peekaygee build`

The built package should be in `pkg-build/`


[structure]: https://docs.openfinance.io/?doc=1uXX58MSy5cOigLKJQLqqrsEGAIFd_BtQ
[microservices]: https://docs.openfinance.io/?doc=1UVhqrdVtuu7wVpNgg00enrDtfTA7gS2S
