import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Alerts from "./pages/Alerts";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "insights", element: <Insights /> },
      { path: "alerts", element: <Alerts /> },
      { path: "clients", element: <Clients /> },
      { path: "settings", element: <Settings /> }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});