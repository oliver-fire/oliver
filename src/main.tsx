import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router";

import "@/shared/styles/global.scss";

Sentry.init({
  dsn: "https://71a33bef04651c199c4d5f9550918b42@o4504275194871808.ingest.us.sentry.io/4510321588830208",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
