import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import { SimpleHttpClientRpn, SimpleRpnRequestConfig } from "simple-http-client-rpn";
import { MockSimpleLogger, MockSimpleHttpClient } from "ts-simple-interfaces-testing";
import * as Service from "../../src/Service";
import { appConfigValidator, AppConfig } from "../../src/Types";
import * as AppWeenie from "../../src/Weenie";

// Some useful testing utilities
export const getUtils = () => {
  const http = new SimpleHttpClientRpn();
  return {
    http: {
      request<T = unknown>(
        config: SimpleRpnRequestConfig & { _auth?: null | Array<Partial<AuthToken>> }
      ): ReturnType<SimpleHttpClientRpn["request"]> {
        // If we pass null for auth, that means DON'T include auth info
        if (config._auth === null) {
          return http.request<T>(config);
        } else {
          // If we don't define auth, just define it as an empty array
          if (!config._auth) {
            config._auth = [];
          }

          // Now merge auth into our config
          return http.request<T>(attachToken(config, config._auth));
        }
      },
    },
  };
};

// This function allows you to easily fake a login by taking the given auth object, combining
// it with the default auth object and
let privkey: Buffer;
export const attachToken = (
  req: SimpleRpnRequestConfig,
  auth: Array<Partial<AuthToken>>
): SimpleRpnRequestConfig => {
  if (!req.headers) {
    req.headers = {};
  }
  req.headers["x-api-gateway-auth"] = jwt.sign(
    merge.apply(merge, [
      {},
      {
        k: "abcde12345",
        a: false,
        r: ["internal"],
        ip: "127.0.0.1",
        u: {
          id: "54321edcba",
          r: ["custserv1"],
          s: null,
        },
      },
      ...auth,
    ]),
    privkey,
    {
      algorithm: "ES256",
      audience: "dev.registry-service",
      expiresIn: 30,
      issuer: "dev.auth-gateway",
    }
  );
  return req;
};

declare type AuthToken = {
  k: string;
  a: boolean;
  r: null | Array<Globals.ClientRoles>;
  ip: string;
  d?: boolean;
  u: null | Partial<{
    id: string;
    r: null | Array<Globals.UserRoles>;
    s: null | Array<Globals.AuthScopes>;
  }>;
};

// Start an instance of the service using fake dependencies and return those fake dependencies
export const startFakeService = async (port: number) => {
  let ready: () => unknown = () => {
    throw new Error(`Premature call to ready function`);
  };

  // prettier-ignore
  const r = await Weenie.Weenie(
    Weenie.configFromFiles<AppConfig>(
      "./config.json",
      "./config.local.json",
      appConfigValidator
    )()
  )
  .and((r: { config: AppConfig }) => {
    // Change the listening port to ${port} for testing
    r.config.http.listeners = [[port, "localhost"]];

    // Get private key for signing fake auth gateway header
    privkey = fs.readFileSync(r.config.tests.apiGatewayKeys.ES256Path);

    // Make any config modifications that you need to here. You may also add or modify mock
    // dependencies, among other things. Following are the default mocks.
    const logger = new MockSimpleLogger();
    return {
      // Mock logger
      logger,

      // Mock pubsub
      pubsub: Promise.resolve(new MockPubSub(logger)),
    };
  })
  // Mock cron
  .and(Weenie.mockCron)
  // Real service management
  .and(Weenie.serviceManagement)
  // Real mysql
  .and(Weenie.mysql)
  // Real auditor
  .and(WympWeenie.auditor)
  // Mock cache
  .and((r: any) => ({ cache: new MockCache(r) }))
  // Real HTTP server
  .and(Weenie.http)
  // Real IO class
  .and(AppWeenie.io)

  // Now button it all up
  .done(async (d) => {
    // In this function, we await any remaining promises, then return a final dependency
    // container, as well as setting the `ready` function to the correct value
    const [ io, pubsub, auditor ] = await Promise.all([ d.io, d.pubsub, d.auditor ]);
    ready = () => d.svc.initialized(true);

    return {
      config: d.config,
      log: d.logger,
      http: d.http,
      getTcpListeners: d.getTcpListeners,
      sql: d.sql,
      cron: d.cron,
      cache: d.cache,
      io,
      pubsub,
      auditor,
    };
  });

  // Start the service and finish the dependencies
  Service.start(r);
  ready();

  return r;
};

// For easy typing of r parameter in test suites
declare type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type FakeDeps = ThenArg<ReturnType<typeof startFakeService>>;
