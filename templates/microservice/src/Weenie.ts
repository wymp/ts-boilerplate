import { SimpleSqlDbInterface, SimpleHttpClientInterface } from "ts-simple-interfaces";
import { Auditor } from "@openfinanceio/data-model-specification";
import { OfnPubSubInterface } from "@openfinanceio/service-lib";
import { Io } from "./Io";

/**
 * This file contains app-specific weenie-style dependency injectors
 */

/**
 * Get IO dependency
 */
export const io = (r: {
  sql: SimpleSqlDbInterface;
  ofapi: SimpleHttpClientInterface;
  pubsub: Promise<OfnPubSubInterface>;
  auditor: Promise<Auditor.ClientInterface>;
}) => {
  return {
    // io has to be a promise because pubsub and auditor are a promises
    io: Promise.all([r.pubsub, r.auditor]).then(
      ([pubsub, auditor]) => new Io(r.sql, r.ofapi, pubsub, auditor)
    ),
  };
};
