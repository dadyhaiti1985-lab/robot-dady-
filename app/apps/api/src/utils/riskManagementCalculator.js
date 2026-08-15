import 'dotenv/config';
import logger from './logger.js';

/**
 * Calculate position size based on risk management rules
 */
export function calculatePositionSize(capital, riskPercent, entryPrice, slPrice) {
  // Validate inputs
  if (!capital || capital <= 0) {
    throw new Error('Capital must be greater than 0');
  }
  if (!riskPercent || riskPercent < 0.5 || riskPercent > 3) {
    throw new Error('Risk percent must be between 0.5% and 3%');
  }
  if (!entryPrice || entryPrice <= 0) {
    throw new Error('Entry price must be greater than 0');
  }
  if (!slPrice || slPrice <= 0) {
    throw new Error('Stop loss price must be greater than 0');
  }

  const riskAmount = capital * (riskPercent / 100);
  const priceDifference = Math.abs(entryPrice - slPrice);

  if (priceDifference === 0) {
    throw new Error('Entry price and stop loss price cannot be the same');
  }

  const positionSize = riskAmount / priceDifference;

  return {
    positionSize: parseFloat(positionSize.toFixed(8)),
    riskAmount: parseFloat(riskAmount.toFixed(2)),
  };
}

/**
 * Calculate stop loss price
 */
export function calculateStopLoss(entryPrice, side = 'long', stopLossPercent = 2) {
  if (!entryPrice || entryPrice <= 0) {
    throw new Error('Entry price must be greater than 0');
  }
  if (stopLossPercent < 0 || stopLossPercent > 10) {
    throw new Error('Stop loss percent must be between 0% and 10%');
  }

  let slPrice;

  if (side.toLowerCase() === 'long') {
    // For long: SL = entryPrice × (1 - stopLossPercent/100)
    slPrice = entryPrice * (1 - stopLossPercent / 100);
  } else if (side.toLowerCase() === 'short') {
    // For short: SL = entryPrice × (1 + stopLossPercent/100)
    slPrice = entryPrice * (1 + stopLossPercent / 100);
  } else {
    throw new Error('Side must be "long" or "short"');
  }

  return parseFloat(slPrice.toFixed(2));
}

/**
 * Calculate take profit price
 */
export function calculateTakeProfit(entryPrice, capital, riskPercent, quantity, side = 'long') {
  if (!entryPrice || entryPrice <= 0) {
    throw new Error('Entry price must be greater than 0');
  }
  if (!capital || capital <= 0) {
    throw new Error('Capital must be greater than 0');
  }
  if (!riskPercent || riskPercent < 0.5 || riskPercent > 3) {
    throw new Error('Risk percent must be between 0.5% and 3%');
  }
  if (!quantity || quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  const riskAmount = capital * (riskPercent / 100);
  const rewardAmount = riskAmount * 3; // 1:3 risk-reward ratio
  const pricePerUnit = rewardAmount / quantity;

  let tpPrice;

  if (side.toLowerCase() === 'long') {
    tpPrice = entryPrice + pricePerUnit;
  } else if (side.toLowerCase() === 'short') {
    tpPrice = entryPrice - pricePerUnit;
  } else {
    throw new Error('Side must be "long" or "short"');
  }

  return {
    tpPrice: parseFloat(tpPrice.toFixed(2)),
    rewardAmount: parseFloat(rewardAmount.toFixed(2)),
  };
}

/**
 * Calculate trailing stop level
 */
export function calculateTrailingStop(entryPrice, currentPrice, side = 'long', profitPercent = 3) {
  if (!entryPrice || entryPrice <= 0) {
    throw new Error('Entry price must be greater than 0');
  }
  if (!currentPrice || currentPrice <= 0) {
    throw new Error('Current price must be greater than 0');
  }
  if (profitPercent < 0 || profitPercent > 100) {
    throw new Error('Profit percent must be between 0% and 100%');
  }

  let trailingStopLevel = null;

  if (side.toLowerCase() === 'long') {
    // For long: if price moved 3% in favor, move SL up 50% of profit
    const profitThreshold = entryPrice * (1 + profitPercent / 100);

    if (currentPrice >= profitThreshold) {
      const profit = currentPrice - entryPrice;
      const trailingAmount = profit * 0.5; // Move SL up 50% of profit
      trailingStopLevel = entryPrice + trailingAmount;
    }
  } else if (side.toLowerCase() === 'short') {
    // For short: if price moved 3% in favor, move SL down 50% of profit
    const profitThreshold = entryPrice * (1 - profitPercent / 100);

    if (currentPrice <= profitThreshold) {
      const profit = entryPrice - currentPrice;
      const trailingAmount = profit * 0.5; // Move SL down 50% of profit
      trailingStopLevel = entryPrice - trailingAmount;
    }
  } else {
    throw new Error('Side must be "long" or "short"');
  }

  return trailingStopLevel ? parseFloat(trailingStopLevel.toFixed(2)) : null;
}

/**
 * Validate position against risk management rules
 */
export function validatePosition(positionData, maxConcurrentPositions = 3, dailyLossLimit = 5, capital = 10000) {
  const {
    positionSize,
    entryPrice,
    slPrice,
    tpPrice,
    riskAmount,
    rewardAmount,
    openPositions = [],
    dailyLoss = 0,
  } = positionData;

  const errors = [];
  const warnings = [];

  // Validate position size doesn't exceed capital
  if (positionSize * entryPrice > capital) {
    errors.push('Position size exceeds available capital');
  }

  // Validate max concurrent positions
  if (openPositions.length >= maxConcurrentPositions) {
    errors.push(`Maximum concurrent positions (${maxConcurrentPositions}) reached`);
  }

  // Validate daily loss limit
  const dailyLossPercent = (dailyLoss / capital) * 100;
  if (dailyLossPercent >= dailyLossLimit) {
    errors.push(`Daily loss limit (${dailyLossLimit}%) reached`);
  } else if (dailyLossPercent >= dailyLossLimit * 0.8) {
    warnings.push(`Daily loss approaching limit: ${dailyLossPercent.toFixed(2)}%`);
  }

  // Validate entry and SL prices
  if (entryPrice === slPrice) {
    errors.push('Entry price and stop loss price cannot be the same');
  }

  // Validate risk-reward ratio
  if (rewardAmount && riskAmount) {
    const riskRewardRatio = rewardAmount / riskAmount;
    if (riskRewardRatio < 1) {
      warnings.push('Risk-reward ratio is less than 1:1');
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    validationError: errors.length > 0 ? errors[0] : null,
  };
}

/**
 * Complete risk management calculation
 */
export function calculateRiskManagement(config) {
  const {
    capital,
    riskPercent,
    entryPrice,
    currentPrice,
    side = 'long',
    maxConcurrentPositions = 3,
    dailyLossLimit = 5,
    openPositions = [],
    dailyLoss = 0,
  } = config;

  // Calculate stop loss
  const slPrice = calculateStopLoss(entryPrice, side, 2);

  // Calculate position size
  const { positionSize, riskAmount } = calculatePositionSize(capital, riskPercent, entryPrice, slPrice);

  // Calculate take profit
  const { tpPrice, rewardAmount } = calculateTakeProfit(entryPrice, capital, riskPercent, positionSize, side);

  // Calculate trailing stop
  const trailingStopLevel = calculateTrailingStop(entryPrice, currentPrice, side, 3);

  // Calculate risk-reward ratio
  const riskRewardRatio = parseFloat((rewardAmount / riskAmount).toFixed(2));

  // Validate position
  const validation = validatePosition(
    {
      positionSize,
      entryPrice,
      slPrice,
      tpPrice,
      riskAmount,
      rewardAmount,
      openPositions,
      dailyLoss,
    },
    maxConcurrentPositions,
    dailyLossLimit,
    capital
  );

  return {
    positionSize: parseFloat(positionSize.toFixed(8)),
    entryPrice: parseFloat(entryPrice.toFixed(2)),
    slPrice: parseFloat(slPrice.toFixed(2)),
    tpPrice: parseFloat(tpPrice.toFixed(2)),
    riskAmount: parseFloat(riskAmount.toFixed(2)),
    rewardAmount: parseFloat(rewardAmount.toFixed(2)),
    riskRewardRatio,
    trailingStopLevel,
    isValid: validation.isValid,
    validationError: validation.validationError,
    warnings: validation.warnings,
  };
}

export default {
  calculatePositionSize,
  calculateStopLoss,
  calculateTakeProfit,
  calculateTrailingStop,
  validatePosition,
  calculateRiskManagement,
};