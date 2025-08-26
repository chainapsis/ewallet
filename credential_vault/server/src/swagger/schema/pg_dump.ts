export const pgDumpSchemas = {
  PgDumpRequestBody: {
    type: "object",
    required: ["password"],
    properties: {
      password: {
        type: "string",
        description: "The admin password",
      },
    },
  },
  PgDumpResponse: {
    type: "object",
    required: ["dump_id", "dump_path", "dump_size", "dump_duration"],
    properties: {
      dump_id: {
        type: "string",
        description: "The id of the pg dump",
      },
      dump_path: {
        type: "string",
        description: "The path to the pg dump",
      },
      dump_size: {
        type: "number",
        description: "The size of the pg dump",
      },
      dump_duration: {
        type: "number",
        description: "The duration of the pg dump",
      },
    },
  },
};
