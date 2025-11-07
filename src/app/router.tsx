import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "@/components/ProtectedRoute";
import {
  AuthCallback,
  Camera,
  Emergency,
  Home,
  Login,
  Map,
  Settings,
} from "@/pages";

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
