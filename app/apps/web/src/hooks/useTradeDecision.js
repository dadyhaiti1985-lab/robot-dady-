import { useState, useRef, useCallback } from 'react';
import { TradeEngine } from '@/utils/TradeEngine';

export function useTradeDecision(accountBalance = 1000) {
  const engineRef = useRef(new TradeEngine(accountBalance));
  const [decision, setDecision] = useState(null);
  const [riskStatus, setRiskStatus] = useState({ isLocked: false, lockoutUntil: null, dailyPnlPct: 0 });

  const updateBalance = useCallback((newBalance) => {
    engineRef.current.accountBalance = newBalance;
  }, []);

  const updateDailyPnL = useCallback((pnlPct) => {
    engineRef.current.dailyPnlPct = pnlPct;
    setRiskStatus({
      isLocked: engineRef.current.isRiskLocked,
      lockoutUntil: engineRef.current.lockoutUntil,
      dailyPnlPct: pnlPct,
    });
  }, []);

  const evaluateSetup = useCallback((setupData, newsEvents = []) => {
    const result = engineRef.current.evaluateTradeSetup(setupData, newsEvents);
    setDecision(result);
    setRiskStatus({
      isLocked: engineRef.current.isRiskLocked,
      lockoutUntil: engineRef.current.lockoutUntil,
      dailyPnlPct: engineRef.current.dailyPnlPct,
    });
    return result;
  }, []);

  const getRiskStatus = useCallback(() => {
    return {
      isLocked: engineRef.current.isRiskLocked,
      lockoutUntil: engineRef.current.lockoutUntil,
      dailyPnlPct: engineRef.current.dailyPnlPct,
    };
  }, []);

  const getDecision = useCallback(() => decision, [decision]);

  return {
    evaluateSetup,
    updateBalance,
    updateDailyPnL,
    getRiskStatus,
    getDecision,
    decision,
    riskStatus,
  };
}
