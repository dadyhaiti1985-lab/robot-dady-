import authMiddleware from '../middleware/auth.js';

const ADMIN_EMAILS = ['meahunlimitedgroupe@gmail.com', 'dadyhaiti1985@gmail.com'];
const SUBSCRIPTION_TITLE = 'ORACLE-TRADER-PRO';

/**
 * GET /auth/me
 * Returns current authenticated user info with admin status.
 * Used by the dashboard to determine role/capabilities on mount.
 */
export default [
  authMiddleware,
  async (req, res) => {
    const isAdmin = req.user?.email && ADMIN_EMAILS.includes(String(req.user.email).toLowerCase());

    res.json({
      id: req.user.id,
      email: req.user.email,
      isAdmin: Boolean(isAdmin),
      role: isAdmin ? 'ACTIVE_UNLIMITED' : 'user',
      subscription: isAdmin
        ? { active: true, plan: SUBSCRIPTION_TITLE, price: '$35/mo', unlimited: true }
        : null,
    });
  },
];
