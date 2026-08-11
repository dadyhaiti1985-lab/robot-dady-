export const TRADING_RULES = {
  MIN_CONFLUENCE_SCORE: 75,
  MIN_RISK_REWARD_RATIO: 2.0,
  MAX_DAILY_DRAWDOWN_PCT: 3.0,
  NEWS_BUFFER_MINUTES: 30,
};

export class TradeEngine {
  constructor(accountBalance = 1000) {
    this.accountBalance = accountBalance;
    this.dailyPnlPct = 0.0;
    this.isRiskLocked = false;
    this.lockoutUntil = null;
  }

  checkRiskLock() {
    if (this.isRiskLocked) {
      if (new Date() >= this.lockoutUntil) {
        this.isRiskLocked = false;
        this.lockoutUntil = null;
        this.dailyPnlPct = 0.0;
        return false;
      }
      return true;
    }
    return false;
  }

  triggerCircuitBreaker() {
    this.isRiskLocked = true;
    this.lockoutUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  evaluateTradeSetup(setupData, marketNewsEvents = []) {
    if (this.checkRiskLock() || this.dailyPnlPct <= -TRADING_RULES.MAX_DAILY_DRAWDOWN_PCT) {
      if (!this.isRiskLocked) this.triggerCircuitBreaker();
      return {
        status: "RISK_LOCK",
        botStatusIndicator: "🔴 Risk Lock",
        message: "Trading paused: Daily drawdown limit (-3%) reached. System locked for 24 hours.",
        report: null,
      };
    }

    const isNewsBlocked = this.checkNewsBuffer(marketNewsEvents);
    if (isNewsBlocked) {
      return {
        status: "NEWS_PAUSED",
        botStatusIndicator: "🟡 Waiting for Setup",
        message: "Trading paused due to high-impact news.",
        report: null,
      };
    }

    const rrRatio = this.calculateRiskReward(setupData.entry, setupData.stopLoss, setupData.takeProfit, setupData.signal);
    const positionSize = this.calculatePositionSize(this.accountBalance, setupData.riskPct, setupData.entry, setupData.stopLoss);

    const confluencePassed = setupData.confluenceScore > TRADING_RULES.MIN_CONFLUENCE_SCORE;
    const rrPassed = rrRatio >= TRADING_RULES.MIN_RISK_REWARD_RATIO;
    const stopLossValid = setupData.stopLoss > 0 && setupData.stopLoss !== setupData.entry;
    const takeProfitValid = setupData.takeProfit > 0 && setupData.takeProfit !== setupData.entry;

    const allConditionsMet = confluencePassed && rrPassed && stopLossValid && takeProfitValid;

    const report = {
      asset: setupData.asset || "BTC-USD",
      timeframe: setupData.timeframe || "4H",
      signal: setupData.signal,
      confluenceScore: setupData.confluenceScore,
      riskPct: setupData.riskPct,
      entry: setupData.entry,
      stopLoss: setupData.stopLoss,
      takeProfit: setupData.takeProfit,
      rrRatio: `1:${rrRatio.toFixed(1)}`,
      positionSizeUSD: positionSize.usd,
      positionSizeUnits: positionSize.units,
      newsCheck: isNewsBlocked ? "Failed" : "Passed",
      riskCheck: allConditionsMet ? "Passed" : "Failed",
      decision: allConditionsMet ? "EXECUTE TRADE" : "REJECTED",
    };

    if (!allConditionsMet) {
      return {
        status: "WAITING",
        botStatusIndicator: "🟡 Waiting for Setup",
        message: "Bot is active but waiting for a high-probability setup.",
        report: report,
      };
    }

    return {
      status: "ARMED_AND_READY",
      botStatusIndicator: "🟢 Armed",
      message: "Setup validated. Dispatching order to Coinbase API...",
      report: report,
    };
  }

  checkNewsBuffer(newsEvents) {
    const now = new Date().getTime();
    const bufferMs = TRADING_RULES.NEWS_BUFFER_MINUTES * 60 * 1000;

    return newsEvents.some((event) => {
      if (event.impact !== "HIGH") return false;
      const newsTime = new Date(event.timestamp).getTime();
      return Math.abs(now - newsTime) <= bufferMs;
    });
  }

  calculateRiskReward(entry, sl, tp, signal) {
    if (!entry || !sl || !tp) return 0;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    return risk === 0 ? 0 : reward / risk;
  }

  calculatePositionSize(balance, riskPct, entry, sl) {
    const riskAmountUSD = balance * (riskPct / 100);
    const priceRiskPerUnit = Math.abs(entry - sl);
    if (priceRiskPerUnit === 0) return { usd: 0, units: 0 };

    const units = riskAmountUSD / priceRiskPerUnit;
    const usdValue = units * entry;
    return {
      usd: usdValue.toFixed(2),
      units: units.toFixed(6),
    };
  }
}
