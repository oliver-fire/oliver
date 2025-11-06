import { createBrowserRouter } from "react-router-dom";

import { Camera, Emergency, Home, Login, Map, Settings, AuthCallback } from "@/pages";
import ProtectedRoute from "@/components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/auth/success",
    element: <AuthCallback />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/camera",
    element: (
      <ProtectedRoute>
        <Camera />
      </ProtectedRoute>
    ),
  },
  {
    path: "/emergency",
    element: (
      <ProtectedRoute>
        <Emergency />
      </ProtectedRoute>
    ),
  },
  {
    path: "/map",
    element: (
      <ProtectedRoute>
        <Map />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
]);
