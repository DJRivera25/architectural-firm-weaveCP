declare global {
  // Allow global `mongoose` cache for hot-reload in development

  var mongoose:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

export {};
