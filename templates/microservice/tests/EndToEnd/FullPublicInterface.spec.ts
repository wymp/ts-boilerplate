import * as F from "./Fixtures";
import { startFakeService, FakeDeps, getUtils } from "./Utils";

// Instantiate publicly avaiable mock dependency container
let r: FakeDeps;
const port = 11224;
const { http } = getUtils();

describe("End-to-End Tests of %{PROJECT_NAME}", () => {
  beforeAll(async () => {
    // Start service with fake deps
    r = await startFakeService(port);
  });

  // Close connections after all tests
  afterAll(async () => {
    (r.sql as any).close();
    r.getTcpListeners().map((l: any) => {
      l.close();
    });
  });

  afterEach(async () => {
    r.pubsub.messages.splice(0, r.pubsub.messages.length);
    r.log.setOpt("outputMessages", false);
    r.log.clear();
    r.ofapi.resetRequestLog();
  });

  /**
   *
   *
   *
   *
   * Tests
   *
   *
   *
   *
   */
  test("Implement End-to-End tests for %{PROJECT_NAME}", async () => {
    const res = await http.request<unknown>({ url: `http://localhost:${port}/some/endpoint` });
    expect(res.data).toMatchObject(F.Example);
  });
});
