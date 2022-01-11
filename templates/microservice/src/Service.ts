import { AppDeps } from "./Types";
import * as Modules from "./Modules";

export const start = (r: AppDeps) => {
  // Register your modules using the dependencies and optionally run any additional setup that your
  // service may require. Note that you should not be instantiating dependencies here - only using
  // dependencies to set up the public and private interfaces of your service. This may include
  // setting up cron jobs, MQ handlers, and HTTP handlers, among possibly other things.
  Modules.MyModule.register(r);
  //MyModule2.register(r); etc....
};
