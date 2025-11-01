import { createBrowserRouter } from "react-router-dom";

import { Camera, Home, Map, Settings } from "@/pages";
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
    path: "/map",
    element: <Map />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
]);
