import * as Weenie from "@wymp/weenie-framework";
import { T, Service } from "../src";
import * as AppWeenie from "./Weenie";

// There are some minimal bootstrap options that you can configure via environment variables:
//
// 1. APP_CONFIG_PREFIX - Set the prefix for environment variable config keys. Defaults to "APP_".
// 2. APP_CONFIG_DEFAULTS_FILE - Set the path for the defaults file for config values. Defaults
//    to "./config.json".
// 3. APP_CONFIG_OVERRIDES_FILES - Set the path for the overrides file for config values.

const prefix = process.env["APP_CONFIG_PREFIX"] || "APP_";
const defaults = process.env["APP_CONFIG_DEFAULTS_FILES"] || "./config.json";
const overrides = process.env["APP_CONFIG_OVERRIDES_FILE"] || "./config.local.json";

const die = (e: Error) => {
  console.error(`Uncaught exception: ${e.stack}`);
  console.error(`Shutting down`);
  process.exit(1);
};
process.on("uncaughtException", die);

(async () => {
  // Start off our dependencies with config, then attach others from here
  const d = await Weenie.Weenie(
    Weenie.config<T.AppConfig>(
      prefix,
      {
        env: process.env,
        defaultsFile: defaults,
        localsFile: overrides,
      },
      T.AppConfigValidator
    )
  )
    // Add in self-auth based on config
    .and(Weenie.backoff("exponential"))
    .and(Weenie.mysql)
    .and(Weenie.pubsub)
    .and(Weenie.http)
    .and(Weenie.auditor)
    .and(AppWeenie.io)
    .done(async (d) => {
      // In this function, we await any remaining promises, then return a final dependency
      // container, as well as setting the `ready` function to the correct value
      const [io, pubsub] = await Promise.all([d.io, d.pubsub]);
      return {
        config: d.config,
        log: d.logger,
        http: d.http,
        cron: d.cron,
        io,
        pubsub,
        svc: d.svc,
      };
    });

  // Start the service with the dependencies
  Service.start(d);

  // Shut down gracefully when requested
  let shuttingDown = false;
  const shutdown = (signal: string) => {
    // if we're not already shutting down....
    if (!shuttingDown) {
      shuttingDown = true;
      const servers = d.getHttpServers();
      if (servers) {
        d.log.notice(`Received ${signal}. Shutting down gracefully.`);
        Promise.all([
          d.pubsub.close(),
          ...servers.map(
            (server) =>
              new Promise((res) => {
                server.close(res);
              })
          ),
        ]).then(() => {
          d.log.notice("All connections ended. Good bye.");
          process.exit();
        });
      } else {
        d.log.notice(`Received ${signal}, but no HTTP servers defined. Shutting down immediately.`);
        process.exit();
      }
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Alert everything that the service has been successfully initialized
  d.svc.initialized(true);
})().catch(die);
