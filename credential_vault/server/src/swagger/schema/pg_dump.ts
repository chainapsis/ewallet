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
  PgDump: {
    type: "object",
    required: [
      "dump_id",
      "status",
      "dump_path",
      "meta",
      "created_at",
      "updated_at",
    ],
    properties: {
      dump_id: {
        type: "string",
        description: "The id of the pg dump",
      },
      status: {
        type: "string",
        description: "The status of the pg dump",
      },
      dump_path: {
        type: "string",
        description: "The path to the pg dump",
      },
      meta: {
        type: "object",
        properties: {
          dump_duration: {
            type: "number",
            description: "The duration of the pg dump",
          },
          dump_size: {
            type: "number",
            description: "The size of the pg dump",
          },
          error: {
            type: "string",
            description: "The error of the pg dump",
          },
        },
        description: "The meta data of the pg dump",
      },
      created_at: {
        type: "string",
        description: "The created at timestamp of the pg dump",
      },
      updated_at: {
        type: "string",
        description: "The updated at timestamp of the pg dump",
      },
    },
  },
};
