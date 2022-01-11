TS Library Boilerplate
=======================================================================

## BOILERPLATE INFO - DISPOSABLE

This repo provides a starting point for the development of typescript library code. It's goals are
the following:

* Encourage and provide a standard core set of dependencies.
* Encourage and provide common configurations for typescript, npm, prettier, and jest.
* Provide hints and context (through this readme) for how best to approach library development.


### Creating a New Library

1. Create your library repo on github. **You're encouraged to prefix the repo name with `ts-` to
   make it clear that your library targets typescript.** For this example, let's say your library
   is called `my-lib`. Your repo would be `ts-my-lib`.
2. Clone this boilerplate repo into a folder with your project name:
   `git clone git@github.com:cfxmarkets/ts-lib-boilerplate.git ts-my-lib`.
3. Replace all instances of `%{LIB_NAME}` in `package.json` with your library's name:
   `sed -i s/%{LIB_NAME}/my-lib/g package.json`.
4. Reset the origin remote URL to your repo's address:
   `git remote set-url origin git@github.com:cfxmarkets/ts-my-lib.git`.
5. Push the current branch to your new github repo to kick it all off:
   `git push -u origin v0.1.x`.

All together, for convenience:

```sh
LIBNAME=my-lib
git clone git@github.com:cfxmarkets/ts-lib-boilerplate.git ts-$LIB_NAME
sed -i "s/%{LIB_NAME}/$LIB_NAME/g" package.json
git remote set-url origin git@github.com:cfxmarkets/ts-$LIB_NAME.git
git push -u origin v0.1.x
```

### Development

1. Make code changes
2. run `npx tsc`
3. Make logical, specific commits

### Versions and Branches

All libraries start off at version `0.1.x`. This is considered alpha development phase.

If your library is already stable (for example, if it's a small and conceptually simple, or if
you've already been working on it elsewhere and have confidence in the interface), you may
freely graduate it to a real major version. However, it's encouraged to keep it in the `0.x` stage
until the interface solidifies.

**For libraries, the main branch should always be a version branch, e.g., `v0.1.x`, `v1.3.x`, or
`v3.x`.** This will allow us to easily backport changes to older versions if and when necessary.

Remember to change the default branch in github when you graduate to a new version.

My Lib
=======================================================================

Overview of the library.

## Development

1. Make code changes
2. run `npx tsc`
3. Make logical, specific commits

