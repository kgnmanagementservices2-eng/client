import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import api from "../services/api.js";

const GlobalStateContext = createContext(null);

const MARKET_KEY = "selected_market_id";

export function GlobalStateProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role;

  const isAdmin = role === "admin" || role === "super_admin";
  const hasGlobalAccess = [
    "admin",
    "super_admin",
    "expense_commission_manager",
    "payroll_manager",
  ].includes(role);

  const [markets, setMarkets] = useState([]);

  const [selectedMarket, setSelectedMarket] = useState(() => {
    const saved = localStorage.getItem(MARKET_KEY);
    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) ? parsed : "";
  });

  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [pendingPayrollCount, setPendingPayrollCount] = useState(0);
  const [pendingCommissionCount, setPendingCommissionCount] = useState(0);

  const fetchMarkets = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getMarkets();
      setMarkets(data || []);

      if (!selectedMarket && data?.length > 0) {
        if (!hasGlobalAccess) {
          handleSetSelectedMarket(data[0].id);
        } else if (data.length === 1) {
          handleSetSelectedMarket(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch markets:", err);
    }
  }, [isAuthenticated, selectedMarket, hasGlobalAccess]);

  const refreshPendingBadge = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      // 🔥 FIX: Pass as an object so Axios formats it correctly (e.g., ?market_id=1)
      const res = await api.getPendingCounts({
        market_id: selectedMarket || undefined,
      });

      const payload = res?.data ? res.data : res;

      setPendingApprovalsCount(Number(payload?.expenses) || 0);
      setPendingPayrollCount(Number(payload?.payroll) || 0);
      setPendingCommissionCount(Number(payload?.commission) || 0);
    } catch (err) {
      console.error("Failed to refresh badges:", err);
    }
  }, [isAuthenticated, selectedMarket]);

  useEffect(() => {
    if (isAuthenticated) fetchMarkets();
  }, [isAuthenticated, fetchMarkets]);

  useEffect(() => {
    if (isAuthenticated) refreshPendingBadge();
  }, [isAuthenticated, selectedMarket, refreshPendingBadge]);

  const handleSetSelectedMarket = (marketId) => {
    const parsedId = marketId ? parseInt(marketId, 10) : "";
    setSelectedMarket(parsedId);

    if (parsedId && !isNaN(parsedId)) {
      localStorage.setItem(MARKET_KEY, parsedId);
    } else {
      localStorage.removeItem(MARKET_KEY);
    }
  };

  const value = {
    markets,
    selectedMarket,
    setSelectedMarket: handleSetSelectedMarket,
    pendingApprovalsCount,
    pendingPayrollCount,
    pendingCommissionCount,
    refreshPendingBadge,
    hasGlobalAccess,
    isAdmin,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
