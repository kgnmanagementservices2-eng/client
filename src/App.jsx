import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

// Layout & Pages
import MainLayout from "./components/layout/MainLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NoInternetPage from "./pages/NoInternetPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SalesPage from "./pages/SalesPage.jsx";
import VariancePage from "./pages/VariancePage.jsx";
import TillPage from "./pages/TillPage.jsx";
import InHandCashPage from "./pages/InHandCashPage.jsx";
import StoreExpensePage from "./pages/StoreExpensePage.jsx";
import ExpenseApprovalPage from "./pages/ExpenseApprovalPage.jsx";
import PayrollExpensePage from "./pages/PayrollExpensePage.jsx";
import PayrollHistoryPage from "./pages/PayrollHistoryPage.jsx";
import CommissionEntryPage from "./pages/CommissionEntryPage.jsx";
import CommissionHistoryPage from "./pages/CommissionHistoryPage.jsx";
import ExpenseHistoryPage from "./pages/ExpenseHistoryPage.jsx";
import PayrollApprovalPage from "./pages/PayrollApprovalPage.jsx";
import CommissionApprovalPage from "./pages/CommissionApprovalPage.jsx";
import CombinedSalesExpenses from "./pages/CombinedSalesExpenses.jsx";
import PickUpApprovalPage from "./pages/PickUpApprovalPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import FinancialCards from "./components/FinancialCards.jsx";
import AdminManagementPage from "./pages/AdminManagementPage.jsx";

const ROLE = {
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  MANAGER: "market_manager",
  EXP_COMM: "expense_commission_manager",
  PAYROLL: "payroll_manager",
};

// Page definitions with allowed roles
const pages = {
  dashboard: {
    title: "Dashboard",
    subtitle: "",
    component: DashboardPage,
    roles: [
      ROLE.ADMIN,
      ROLE.SUPER_ADMIN,
      ROLE.MANAGER,
      ROLE.EXP_COMM,
      ROLE.PAYROLL,
    ],
  },
  sales: {
    title: "Sales",
    subtitle: "",
    component: SalesPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.EXP_COMM],
  },
  "admin-management": {
    component: AdminManagementPage,
    title: "Admin Management",
    subtitle: "Manage Markets, Stores, and Employees",
    roles: ["admin", "super_admin", "payroll_manager"],
  },
  variance: {
    title: "Variance",
    subtitle: "",
    component: VariancePage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.EXP_COMM],
  },
  till: {
    title: "Til Amount",
    subtitle: " ",
    component: TillPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.EXP_COMM],
  },
  "in-hand-cash": {
    title: "In Hand Cash",
    subtitle: "",
    component: InHandCashPage,
    roles: [
      ROLE.ADMIN,
      ROLE.SUPER_ADMIN,
      ROLE.MANAGER,
      ROLE.EXP_COMM,
      ROLE.PAYROLL,
    ],
  },
  "store-expense": {
    title: "Store Expense",
    subtitle: "",
    component: StoreExpensePage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.EXP_COMM],
  },
  "expense-history": {
    title: "Expense History",
    subtitle: "",
    component: ExpenseHistoryPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.MANAGER, ROLE.EXP_COMM],
  },
  "expense-approval": {
    title: "Expense Approval",
    subtitle: "",
    component: ExpenseApprovalPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.EXP_COMM],
  },
  "payroll-expense": {
    title: "Payroll & Commission Expense",
    subtitle: "",
    component: PayrollExpensePage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.PAYROLL, ROLE.EXP_COMM],
  },
  "payroll-history": {
    title: "Payroll History",
    subtitle: "",
    component: PayrollHistoryPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.PAYROLL, ROLE.MANAGER],
  },
  "commission-entry": {
    title: "Commission Entry",
    subtitle: "",
    component: CommissionEntryPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.EXP_COMM],
  },
  "commission-history": {
    title: "Commission History",
    subtitle: "",
    component: CommissionHistoryPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.EXP_COMM, ROLE.MANAGER],
  },
  "payroll-approval": {
    title: "Payroll Approval",
    subtitle: "",
    component: PayrollApprovalPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.PAYROLL],
  },
  "commission-approval": {
    title: "Commission Approval",
    subtitle: "",
    component: CommissionApprovalPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.EXP_COMM],
  },
  "pickup-approval": {
    title: "Pick Up Approval",
    subtitle: "",
    component: PickUpApprovalPage,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.EXP_COMM],
  },
  "combined-sales-expenses": {
    title: "Cash Tracker",
    subtitle: "",
    component: CombinedSalesExpenses,
    roles: [
      ROLE.ADMIN,
      ROLE.SUPER_ADMIN,
      ROLE.MANAGER,
      ROLE.EXP_COMM,
      ROLE.PAYROLL,
    ],
  },
};

/**
 * Inner routing component that utilizes React Router hooks
 */
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Backward compatibility: Convert onNavigate calls to URL routing
  const handleNavigate = (pathKey, params = null) => {
    navigate(`/cashflow/${pathKey}`, { state: params });
  };

  // Backward compatibility: Native browser back routing
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen w-full flex items-center justify-center">
        Loading session...
      </div>
    );
  }

  // Unauthenticated routing
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onNavigate={handleNavigate} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated Routing
  return (
    <Routes>
      {/* Default Redirect to Dashboard */}
      <Route path="/" element={<Navigate to="/cashflow/dashboard" replace />} />
      <Route
        path="/cashflow"
        element={<Navigate to="/cashflow/dashboard" replace />}
      />

      {/* Map through your pages definition to generate standard URL Routes */}
      {Object.entries(pages).map(([pathKey, def]) => {
        const CurrentPage = def.component;

        return (
          <Route
            key={pathKey}
            path={`/cashflow/${pathKey}`}
            element={
              <ProtectedRoute
                roles={def.roles}
                onNavigate={handleNavigate}
                onBack={handleBack}
                canGoBack={location.key !== "default"}
                currentPage={pathKey}
                pageTitle={def.title}
                pageSubtitle={def.subtitle}
              >
                {/* Passes the handleNavigate wrapper down, allowing your existing
                  components to trigger routes using `onNavigate("sales")` exactly
                  like they used to!
                */}
                <CurrentPage
                  onNavigate={handleNavigate}
                  navParams={location.state}
                />
              </ProtectedRoute>
            }
          />
        );
      })}

      {/* Catch-all to redirect invalid routes to dashboard */}
      <Route path="*" element={<Navigate to="/cashflow/dashboard" replace />} />
    </Routes>
  );
}

/**
 * Main App Root
 */
export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <NoInternetPage />;
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <AppRoutes />
    </Router>
  );
}
