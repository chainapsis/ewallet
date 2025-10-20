export type EventType = {
  type: string;
  [key: string]: any;
};

export type EventHandlerType = {
  type: string;
  handler: (payload: any) => void;
};

export type EventEmitError =
  | {
      type: "handle_error";
      error: string;
    }
  | {
      type: "handler_not_found";
      event_type: string;
    };
