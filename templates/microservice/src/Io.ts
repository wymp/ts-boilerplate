import { SimpleSqlDbInterface, SimpleHttpClientInterface } from "ts-simple-interfaces";

/**
 * This class abstracts all io access into generalized or specific declarative method calls
 */
export class Io {
  public constructor(
    protected db: SimpleSqlDbInterface,
    protected amqp: PubSubInterface,
    protected audit: Auditor.ClientInterface
  ) {}
}
