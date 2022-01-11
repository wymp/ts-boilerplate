import { AppDeps } from "../Types";

/**
 * This is an example of how you might create a module. In this case, it's a single file. In some
 * cases, it may be a subdirectory with various files in it.
 *
 * In most cases, you'll usually only want to expose a `register` function publicly that accepts
 * a dependency container and then uses it to register cronjobs, http endpoints, and MQ listeners
 * from the module.
 */

export const register = (r: Pick<AppDeps, "log" | "config" | "http" | "pubsub">) => {
  r.log.info(`Registering MyModule in ${r.config.envName}`);
  r.http.get(`/some/endpoint`, (req, res, next) => {
    r.log.notice(`Executing some functionality`);
    res.status(200).send({ one: 1, two: 2, bool: true });
  });
  r.pubsub.subscribe(
    { "exchange-stream": ["*.*.*"] },
    (msg, log) => {
      return Promise.resolve(true);
    },
    { queue: { name: "my-module-exchange-stuff" } }
  );
};
