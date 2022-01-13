import { promises as fs } from "fs";

/**
 * Verbose-aware output logging
 */
function log(str: string, verbose: boolean): void {
  if (verbose) {
    console.log(str);
  }
}

/**
 * Return helptext
 */
async function helptext(repopath: string, verbose: boolean = false): Promise<string> {
  const types = await getTypes(repopath, verbose);
  return `@wymp/boilerplate - Create a new project based on pre-defined boilerplate from Wymp

SYNOPSIS
    npx @wymp/boilerplate [--verbose] create <type> <target>
    npx @wymp/boilerplate [--verbose] --version
    npx @wymp/boilerplate [--verbose] --help|-h

DESCRIPTION
    This script is intended to be used via npx to create a new project based on pre-defined
    boilerplate.  Target may be any directory, existing or new. If the directory already exists,
    boilerplate files are simply copied to it. If the directory does not yet exist, it is created
    and then boilerplate files are copied to it.

TYPES
    Available types of boilerplate are the following:

      * ${types.join("\n      * ")}

OPTIONS
    --verbose      Output additional information during execution.
`;
}

/**
 * Return version information
 */
async function version(repopath: string, verbose: boolean = false): Promise<string> {
  log(`Getting version`, verbose);
  const pkgstr = await fs.readFile(`${repopath}/package.json`, "utf8");
  const pkg = <any>JSON.parse(pkgstr);
  return `@wymp/boilerplate v${pkg.version}`;
}

/**
 * Return an array of available types of boilerplate, based on subdirectories under `/templates`
 */
async function getTypes(repopath: string, verbose: boolean = false): Promise<Array<string>> {
  log(`Getting types`, verbose);
  const boilerplates = await fs.readdir(`${repopath}/templates`);
  return boilerplates.map((path) => path.split(/[\/\\]/).pop()!);
}

/**
 * Shortcut to check to see if a file or directory exists
 */
function exists(path: string): Promise<boolean> {
  return fs
    .access(path)
    .then((_) => true)
    .catch((e) => false);
}

/**
 * Copy everything from `src` into `targ`, first ensuring that `targ` exists.
 * @returns An array (possible empty) of error messages.
 */
async function copyAll(
  src: string,
  targ: string,
  verbose: boolean = false
): Promise<Array<string>> {
  log(`Copying files from ${src} to ${targ}`, verbose);

  // Create the target, if necessary
  await fs.mkdir(targ, { recursive: true });

  // Now recurisvely copy everything from src into targ
  const files = await fs.readdir(src, { encoding: "utf8", withFileTypes: true });
  const p: Array<Promise<Array<string>>> = [];
  for (const file of files) {
    if (file.isSymbolicLink()) {
      const linkpath = await fs.readlink(`${src}/${file.name}`);
      p.push(
        fs
          .symlink(linkpath, `${targ}/${file.name}`)
          .then((_) => <Array<string>>[])
          .catch((e) => [e.message])
      );
    } else if (file.isDirectory()) {
      p.push(
        copyAll(`${src}/${file.name}`, `${targ}/${file.name}`, verbose).catch((e) => [e.message])
      );
    } else {
      p.push(
        fs
          .copyFile(`${src}/${file.name}`, `${targ}/${file.name}`)
          .then((_) => <Array<string>>[])
          .catch((e) => [e.message])
      );
    }
  }
  const errorSets = await Promise.all(p);
  return errorSets.reduce<Array<string>>((agg, cur) => agg.concat(cur), []);
}

/**
 * Validate inputs and execute the requested command
 */
async function go(argv: Array<string>) {
  // See if we're in "verbose" mode
  const verbose: boolean = (argv.find((arg) => arg === "--verbose") && true) || false;
  if (verbose) {
    const i = argv.findIndex((arg) => arg === "--verbose");
    argv.splice(i, 1);
  }

  // First make sure we can locate our repo path, since all other functionality depends on that
  const binary = argv[1];
  const pathParts = binary.split(/[\/\\]/);
  let repopath: string | false = `${pathParts.slice(0, pathParts.length - 1).join("/")}`;
  log(`Starting path: ${repopath}`, verbose);

  // Analyze the directory tree to see if we can find the repo path
  let n = 1;
  while (true) {
    // If we've tried more than three times, abort
    if (n >= 4) {
      log(`Made ${n} attempts. Giving up.`, verbose);
      repopath = false;
      break;
    }

    // Check to see if we've got both templates and package.json
    log(`Testing path ${repopath}`, verbose);
    const [pkgExists, templatesExists] = await Promise.all([
      exists(`${repopath}/package.json`),
      exists(`${repopath}/templates`),
    ]);
    if (pkgExists && templatesExists) {
      // if so, we found the repopath! Break out
      log(`Found repopath!`, verbose);
      break;
    } else {
      // Otherwise, if lib exists, try that
      const libExists = await exists(`${repopath}/lib/node_modules/@wymp/boilerplate`);
      if (libExists) {
        log(`Found 'lib' substructure. Setting repopath to that and trying again.`, verbose);
        repopath = `${repopath}/lib/node_modules/@wymp/boilerplate`;
      } else {
        // Otherwise, if @wymp/boilerplate exists, try that
        const wympBoilerplateExists = await exists(`${repopath}/@wymp/boilerplate`);
        if (wympBoilerplateExists) {
          log(
            `Found '@wymp/boilerplate' substructure. Setting repopath to that and trying again.`,
            verbose
          );
          repopath = `${repopath}/@wymp/boilerplate`;
        } else {
          // Otherwise, go back another directory
          log(`Trying one directory up.`, verbose);
          const pathParts: Array<string> = repopath.split(/[\/\\]/);
          repopath = `${pathParts.slice(0, pathParts.length - 1).join("/")}`;
        }
      }
    }

    // Augment our attempt counter
    n++;
  }

  // If we couldn't find it, throw an error
  if (!repopath) {
    throw new Error(`Couldn't find the @wymp/boilerplate repo directory! Can't proceed :(`);
  }

  // Now that we have a repo directory, service the command
  const cmd = argv[2];

  // Version
  if (cmd === "--version") {
    console.log(await version(repopath));
    return;
  }

  // Help
  if (cmd === "--help" || cmd === "-h") {
    console.log(await helptext(repopath));
    return;
  }

  // Create
  if (cmd === "create") {
    // Make sure we've got a valid type and target
    const typ = argv[3];
    if (!typ) {
      throw new Error(
        `You must specify a type of boilerplate to use and a target directory. See ` +
          `'@wymp/boilerplate --help' for help.`
      );
    }
    const validTypes = await getTypes(repopath);
    if (!validTypes.find((t) => t === typ)) {
      throw new Error(
        `The type of boilerplate you've specified, '${typ}', is not one of the available types ` +
          `offered. Please see '@wymp/boilerplate --help' for the available types of boilerplate.`
      );
    }

    const _targ = argv[4];
    if (!_targ) {
      throw new Error(
        `You must specify a target directory to create your project in. See '@wymp/boilerplate ` +
          `--help' for help.`
      );
    }
    const targ = _targ[_targ.length - 1] === "/" ? _targ.substring(0, _targ.length - 1) : _targ;

    // Copy everything from boilerplate into targ
    const errors = await copyAll(`${repopath}/templates/${typ}`, targ);

    if (errors.length > 0) {
      throw new Error(
        `Copy failed. There were ${errors.length} errors when copying files:\n\n` +
          `  * ${errors.join("\n  * ")}`
      );
    }

    // Return
    return;
  }

  // Anything else
  throw new Error(
    `Unknown command or option '${cmd}'. Try 'npx @wymp/boilerplate --help' for options.`
  );
}

// Execute.
go(process.argv).catch((e) => {
  console.error(`Error: ${e.message}`);
});
