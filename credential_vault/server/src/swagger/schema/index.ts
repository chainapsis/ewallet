import { commonSchemas } from "./common";
import { keyShareSchemas } from "./key_share";
import { pgDumpSchemas } from "./pg_dump";

export const schemas = {
  ...commonSchemas,
  ...keyShareSchemas,
  ...pgDumpSchemas,
};
