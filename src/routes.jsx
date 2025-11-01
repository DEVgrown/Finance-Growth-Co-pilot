import { createBrowserRouter } from "react-router-dom";
import Layout from "./layouts/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Transactions from "./pages/Transactions";
import Invoices from "./pages/Invoices";
import CashFlow from "./pages/CashFlow";
import Suppliers from "./pages/Suppliers";
import Credit from "./pages/Credit";
import Settings from "./pages/Settings";
import VoiceAssistant from "./pages/VoiceAssistant";
import ProactiveAlerts from "./pages/ProactiveAlerts";
import CustomerPortal from "./pages/CustomerPortal";
import Register from "./pages/Register";
import ElevenLabs from "./pages/ElevenLabs";
import Clients from "./pages/Clients";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { 
        index: true, 
        element: <Dashboard />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "dashboard", 
        element: <Dashboard />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "insights", 
        element: <Insights />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "proactive-alerts", 
        element: <ProactiveAlerts />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "transactions", 
        element: <Transactions />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "invoices", 
        element: <Invoices />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "cash-flow", 
        element: <CashFlow />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "suppliers", 
        element: <Suppliers />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "credit", 
        element: <Credit />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "clients", 
        element: <Clients />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "customer-portal", 
        element: <CustomerPortal />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "voice-assistant", 
        element: <VoiceAssistant />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "elevenlabs", 
        element: <ElevenLabs />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "settings", 
        element: <Settings />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "register", 
        element: <Register />,
        errorElement: <ErrorBoundary />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

// Suppress React Router future flag warning
console.log = ((originalLog) => {
  return function (...args) {
    if (args[0]?.includes?.('React Router Future Flag Warning')) {
      return; // Suppress this warning
    }
    originalLog.apply(console, args);
  };
})(console.log);