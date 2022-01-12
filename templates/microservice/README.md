# TS Microservice Boilerplate

This is a standard Wymp-based domain service.

## Settng Up a New Domain Service Project

1. Create your repo on Github
2. Use `npx @wymp/boilerplate create microservice /path/to/your-project` to create the boilerplate
   for your new project.
3. `cd` into your new repo and run `./scripts/setup [project name] [project nickname] [github namespace]`
   to fill in the template with your actual values.
4. Give the project a look to see what else you might want to change for the initial commit.
5. Run `git init` to initialize a git repo for your project, then add your github repo as a remote,
   make your first commit, and push it up to github.

All together, this might look like the following for a new service called (for example) the Auditor
Service:

```
# Project Name: auditor-service
# Nickname: auditor
# Namespace: wymp
#
# Create github repo auditor-service
# then...

cd ~/dev
npx @wymp/boilerplate create microservice auditor-service
cd auditor-service
./scripts/setup auditor-service auditor wymp

# Initialize the repo, add everything, then check to make sure everything looks alright. You may
# want to double check for files that should or shouldn't be ignored in `.gitignore` here.
git init
git remote add origin git@github.com:wymp/auditor-service.git

# (I like to change the master branch name to a version-based name, but that's optional)
git branch -m master v1.x

git add ./
git status

git commit -m ":sparkles:"
git push -u origin v1.x
```

## Development

This service is written in typescript `^4.0`. You may develop it in the traditional way by just
running `npm install` and proceeding as normal.

**Note: This repo uses development libraries like jest and prettier that only work on Node 10 and
above. If you get errors when committing or testing, try switching to Node 10 using nvm.**

## Running

To run the service for testing, you have a few options, all of which start with compiling it (run
`tsc` -- this compiles everything into the `dist` directory). Once compiled, you can adjust local
config, if necessary, and run the application in place by running `node ./dist/index.js`;
