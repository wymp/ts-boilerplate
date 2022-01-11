import {
  ofapiConfigValidator,
  Weenie,
  OfnPubSubInterface,
  httpConfigValidator,
} from "@openfinanceio/service-lib";
import { SimpleLoggerInterface, SimpleHttpRequestHandlerInterface } from "ts-simple-interfaces";
import { Io } from "./Io";
import * as rt from "runtypes";

export const appConfigValidator = rt.Intersect(
  Weenie.baseConfigValidator,
  rt.Record({
    http: httpConfigValidator,
    amqp: Weenie.mqConnectionConfigValidator,
    db: Weenie.databaseConfigValidator,
    ofapi: ofapiConfigValidator,
    domain: rt.Literal("%{PROJECT_NAME}"),
    tests: rt.Record({
      apiGatewayKeys: rt.Record({
        ES256Path: rt.String,
        RS256Path: rt.String,
      }),
    }),
  })
);

export type AppConfig = rt.Static<typeof appConfigValidator>;

/**
 * An easier way to reference dependencies in modules
 */
export type AppDeps = {
  config: AppConfig;
  log: SimpleLoggerInterface;
  http: SimpleHttpRequestHandlerInterface;
  cron: Weenie.CronInterface;
  io: Io;
  pubsub: OfnPubSubInterface;
};
