import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PlansList from '@/components/PlansList.jsx';

/**
 * Shipped pricing page.
 *
 * Renders the subscription tiers via the shipped <PlansList />. Plans are
 * fetched at runtime through useEcommerceSubscriptionsPlans (shipped read-only
 * hook); per-card SubscribeButton / ManageSubscriptionButton swap is handled
 * inside PlansList.
 *
 * Mount on App.jsx as a PUBLIC route at /plans (no auth gate — anonymous
 * visitors browse pricing; SubscribeButton redirects to /login when needed):
 *   import PlansPage from '@/pages/PlansPage.jsx';
 *   <Route path="/plans" element={<PlansPage />} />
 *
 * Header/nav MUST include a "Plans" or "Pricing" link to /plans.
 *
 * Agents may restyle copy/hero/surrounding sections freely (FAQ, comparison
 * tables, value props, testimonials — whatever fits the site). PRESERVE the
 * <PlansList /> mount inside the page. Do NOT recreate plan-fetching,
 * subscribe-button logic, or hardcode a plans array — those live in
 * PlansList and its dependencies and would create a parallel (broken) flow.
 */
class PlansErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error) {
		return { error };
	}

	componentDidCatch(error, info) {
		// Surface the exact failure for debugging instead of a blank/500-style screen.
		console.error('[/plans] render failed:', error, info?.componentStack);
	}

	render() {
		if (this.state.error) {
			return (
				<div className="glass-card p-8 text-center">
					<p className="text-rose font-mono-metrics mb-2">Koneksyon sèvè a echwe / Server connection failed</p>
					<p className="text-muted-foreground text-sm mb-6">
						Nou pa t kapab chaje plan abònman yo kounye a. Eseye ankò nan yon moman.
					</p>
					<button
						type="button"
						onClick={this.props.onRetry}
						className="rounded-md border border-primary/50 bg-primary/10 px-5 py-2 text-primary hover:bg-primary/20"
					>
						Eseye ankò / Retry
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}

export default function PlansPage() {
	const [attempt, setAttempt] = useState(0);

	return (
		<div className="mx-auto max-w-6xl px-6 py-12">
			<Helmet>
				<title>Plans & Pricing | ORACLE-TRADER-PRO</title>
				<meta
					name="description"
					content="Compare ORACLE-TRADER-PRO subscription plans and unlock autonomous AI trading, encrypted exchange credentials and live signals."
				/>
			</Helmet>
			<header className="mb-10 text-center">
				<h1 className="text-3xl font-semibold sm:text-4xl">Choose your plan</h1>
				<p className="mt-3 text-muted-foreground">
					Pick the tier that fits how you'll use it. Upgrade or cancel anytime.
				</p>
			</header>
			<PlansErrorBoundary key={attempt} onRetry={() => setAttempt((n) => n + 1)}>
				<PlansList key={attempt} />
			</PlansErrorBoundary>
		</div>
	);
}
