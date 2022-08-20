import { SimpleSqlDbInterface, SimpleHttpClientInterface } from "ts-simple-interfaces";
import { Io } from "./Io";

/**
 * This file contains app-specific weenie-style dependency injectors
 */

/**
 * Get IO dependency
 */
export const io = (r: {
  sql: SimpleSqlDbInterface;
  pubsub: Promise<PubSubInterface>;
  auditor: Promise<Auditor.ClientInterface>;
}) => {
  return {
    // io has to be a promise because pubsub and auditor are a promises
    io: Promise.all([r.pubsub, r.auditor]).then(
      ([pubsub, auditor]) => new Io(r.sql, pubsub, auditor)
    ),
  };
};
