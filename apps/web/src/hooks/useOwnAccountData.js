import { useCallback, useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';

const EMPTY = {
  userId: null,
  balance: { total: 0, available: 0, hold: 0, change24h: 0 },
  portfolio: [],
  trades: [],
  credentials: null,
  loading: false,
};

/**
 * Loads ONLY the signed-in user's own account data from PocketBase.
 * Every query is filtered by the authenticated user id, so no other
 * account's balance, portfolio, trades or API status can ever be shown.
 * Anonymous visitors get zeroed values (never someone else's data).
 */
export function useOwnAccountData() {
  const [state, setState] = useState({ ...EMPTY });

  const load = useCallback(async () => {
    const userId = pb.authStore.record?.id ?? null;
    if (!userId) {
      setState({ ...EMPTY });
      return;
    }
    setState((s) => ({ ...s, userId, loading: true }));

    const own = `userId = "${userId}"`;
    const [balance, portfolio, trades, credentials] = await Promise.all([
      pb.collection('bot_account_balance')
        .getList(1, 1, { filter: own, sort: '-created', requestKey: 'own-balance' })
        .then((r) => r.items[0] ?? null)
        .catch(() => null),
      pb.collection('bot_portfolio')
        .getList(1, 20, { filter: own, sort: '-created', requestKey: 'own-portfolio' })
        .then((r) => r.items)
        .catch(() => []),
      pb.collection('trades')
        .getList(1, 10, { filter: own, sort: '-created', requestKey: 'own-trades' })
        .then((r) => r.items)
        .catch(() => []),
      pb.collection('oracle_credentials')
        .getFirstListItem(`owner = "${userId}"`, { requestKey: 'own-creds' })
        .catch(() => null),
    ]);

    setState({
      userId,
      balance: {
        total: Number(balance?.total ?? 0),
        available: Number(balance?.available ?? 0),
        hold: Number(balance?.hold ?? 0),
        change24h: Number(balance?.last_24h_change ?? 0),
      },
      portfolio: portfolio.map((p) => ({
        asset: p.asset,
        value: Number(p.value ?? 0),
        percentage: Number(p.percentage ?? 0),
      })),
      trades: trades.map((t) => ({
        id: t.id,
        asset: t.asset,
        type: t.type,
        pnl: Number(t.pnl ?? 0),
      })),
      credentials: credentials
        ? { exchange: credentials.exchange, connected: true }
        : null,
      loading: false,
    });
  }, []);

  useEffect(() => {
    load();
    const unsub = pb.authStore.onChange(() => load());
    return unsub;
  }, [load]);

  return { ...state, reload: load };
}

export default useOwnAccountData;
