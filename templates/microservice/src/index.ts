import { appConfigValidator, AppConfig, AppDeps } from "./Types";
import * as Service from "./Service";
import * as AppWeenie from "./Weenie";

const die = (e: any) => {
  console.error(`UNEXPECTED FATAL ERROR`);
  console.error(e);
  process.exit(1);
};
process.on("uncaughtException", die);

/**
 * This is the block that actually starts the service. First it instantiates all dependencies
 * using a Weenie block, then it registers functionality using those dependencies.
 */
(async () => {
  // prettier-ignore
  const r = await Weenie.service<AppConfig>(appConfigValidator)
  .and(Weenie.backoff("exponential"))
  .and(Weenie.mysql)
  .and(Weenie.pubsub)
  .and(Weenie.http)
  .and(Weenie.auditor)
  .and(AppWeenie.io)
  .done(async (d) => {
    // In this function, we await any remaining promises, then return a final dependency
    // container, as well as setting the `ready` function to the correct value
    const [ io, pubsub ] = await Promise.all([ d.io, d.pubsub ]);
    return {
      config: d.config,
      log: d.logger,
      http: d.http,
      cron: d.cron,
      io,
      pubsub,
      svc: d.svc,
    }
  });

  Service.start(r);

  // When done with everything, call `ready` to let the service manager know we're up and running
  r.svc.initialized(true);
})().catch(die);
