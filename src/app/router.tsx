import { createBrowserRouter } from "react-router-dom";

import { Camera, Emergency, Home, Map, Settings } from "@/pages";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/camera",
    element: <Camera />,
  },
  {
    path: "/emergency",
    element: <Emergency />,
  },
  {
    path: "/map",
    element: <Map />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
]);
