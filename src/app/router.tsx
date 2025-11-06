import { createBrowserRouter } from "react-router-dom";

import { Camera, Emergency, Home, Login, Map, Settings } from "@/pages";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
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
