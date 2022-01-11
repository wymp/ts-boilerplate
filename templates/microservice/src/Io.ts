import { SimpleSqlDbInterface, SimpleHttpClientInterface } from "ts-simple-interfaces";
import { Auditor } from "@openfinanceio/data-model-specification";
import { OfnPubSubInterface } from "@openfinanceio/service-lib";

/**
 * This class abstracts all io access into generalized or specific declarative method calls
 */
export class Io {
  public constructor(
    protected db: SimpleSqlDbInterface,
    protected ofapi: SimpleHttpClientInterface,
    protected amqp: OfnPubSubInterface,
    protected audit: Auditor.ClientInterface
  ) {}
}
