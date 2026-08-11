import React, { useMemo, useState } from 'react';
import { Copy, Mail, Send, Share2, Users, Wallet, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import './ViewStyles.css';

const SAMPLE_REFERRALS = [
	{ id: 'usr-a91', name: 'Trader-91', joinedAt: '2026-08-09T14:20:00Z', tier: 'Tier 1', volume: 14820, commission: 222.3, status: 'Active' },
	{ id: 'usr-k22', name: 'Market-K22', joinedAt: '2026-08-05T10:45:00Z', tier: 'Tier 2', volume: 8640, commission: 108, status: 'Pending' },
	{ id: 'usr-z18', name: 'Alpha-Z18', joinedAt: '2026-07-29T18:10:00Z', tier: 'Tier 1', volume: 19350, commission: 290.25, status: 'Active' },
	{ id: 'usr-p07', name: 'Quant-P07', joinedAt: '2026-07-18T09:05:00Z', tier: 'VIP', volume: 41100, commission: 616.5, status: 'Active' },
	{ id: 'usr-n44', name: 'Signal-N44', joinedAt: '2026-07-11T12:30:00Z', tier: 'Tier 2', volume: 5020, commission: 62.75, status: 'Pending' },
];

function money(value) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(Number(value || 0));
}

function tierFromCommission(totalCommission) {
	if (totalCommission >= 500) return { label: 'VIP Tier', rate: '35%' };
	if (totalCommission >= 200) return { label: 'Tier 2', rate: '25%' };
	return { label: 'Tier 1', rate: '15%' };
}

function SocialButton({ icon: Icon, label, href, color }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 8,
				padding: '10px 12px',
				borderRadius: 12,
				border: `1px solid ${color}40`,
				background: `${color}18`,
				color,
				fontWeight: 700,
				fontSize: 12,
				textDecoration: 'none',
			}}
		>
			<Icon size={14} />
			{label}
		</a>
	);
}

export default function ReferralView() {
	const { currentUser } = useAuth();
	const [search, setSearch] = useState('');

	const referralIdentity = useMemo(() => {
		const seed = String(currentUser?.email || currentUser?.id || 'ORACLE-GUEST').toUpperCase().replace(/[^A-Z0-9]/g, '');
		const code = seed.slice(0, 4).padEnd(4, 'X') + '-' + seed.slice(-4).padStart(4, '7');
		const link = `https://oracletrader.pro/ref/${code}`;
		return { code, link };
	}, [currentUser?.email, currentUser?.id]);

	const filteredReferrals = useMemo(() => {
		const term = search.trim().toLowerCase();
		return SAMPLE_REFERRALS.filter((row) => {
			if (!term) return true;
			return [row.name, row.id, row.tier].join(' ').toLowerCase().includes(term);
		});
	}, [search]);

	const totals = useMemo(() => {
		const totalEarned = SAMPLE_REFERRALS.reduce((sum, row) => sum + row.commission, 0);
		const pending = SAMPLE_REFERRALS.filter((row) => row.status === 'Pending').reduce((sum, row) => sum + row.commission, 0);
		const invited = SAMPLE_REFERRALS.length;
		const tier = tierFromCommission(totalEarned);
		return { totalEarned, pending, invited, tier };
	}, []);

	const shareMessage = encodeURIComponent(`Join me on Oracle Trader Pro and start trading smarter: ${referralIdentity.link}`);

	function copyText(value, label) {
		navigator.clipboard.writeText(value).then(() => {
			toast.success(`${label} copied`);
		}).catch(() => {
			toast.error(`Unable to copy ${label.toLowerCase()}`);
		});
	}

	function claimEarnings() {
		toast.success('Claim request queued. Earnings will route through your payout workflow.');
	}

	return (
		<div className="view-container">
			<div className="view-header">
				<h1>Referral</h1>
				<p>Institutional affiliate center for referral links, commissions, tier growth, and invited-user performance</p>
			</div>

			<div style={{ display: 'grid', gap: 20 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 0.9fr)', gap: 20 }}>
					<div className="assets-section">
						<h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Share2 size={18} color="#38BDF8" /> Personal Referral Link</h3>
						<div style={{ display: 'grid', gap: 14 }}>
							<div style={{ border: '1px solid rgba(30,42,59,0.85)', borderRadius: 14, padding: 16, background: 'rgba(11,18,32,0.72)' }}>
								<div style={{ color: '#8DA2BD', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>Referral Link</div>
								<div style={{ marginTop: 8, color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, wordBreak: 'break-all' }}>{referralIdentity.link}</div>
								<div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
									<button type="button" onClick={() => copyText(referralIdentity.link, 'Referral link')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.12)', color: '#86EFAC', cursor: 'pointer', fontWeight: 700 }}><Copy size={14} /> Copy Link</button>
									<SocialButton icon={Send} label="WhatsApp" href={`https://wa.me/?text=${shareMessage}`} color="#22C55E" />
									<SocialButton icon={Send} label="Telegram" href={`https://t.me/share/url?url=${encodeURIComponent(referralIdentity.link)}&text=${shareMessage}`} color="#38BDF8" />
									<SocialButton icon={Share2} label="X / Twitter" href={`https://twitter.com/intent/tweet?text=${shareMessage}`} color="#A78BFA" />
									<SocialButton icon={Mail} label="Email" href={`mailto:?subject=Join Oracle Trader Pro&body=${shareMessage}`} color="#FBBF24" />
								</div>
							</div>
							<div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, width: 'fit-content', padding: '12px 14px', borderRadius: 999, border: '1px solid rgba(37,99,235,0.35)', background: 'rgba(37,99,235,0.12)', color: '#93C5FD', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
								Referral Code: {referralIdentity.code}
								<button type="button" onClick={() => copyText(referralIdentity.code, 'Referral code')} style={{ border: 'none', background: 'transparent', color: '#93C5FD', cursor: 'pointer', display: 'inline-flex' }}><Copy size={14} /></button>
							</div>
						</div>
					</div>

					<div className="assets-section">
						<h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={18} color="#FBBF24" /> How It Works</h3>
						<div style={{ display: 'grid', gap: 12 }}>
							{['1. Share Link', '2. Friends Sign Up & Trade', '3. Earn Real-Time Commissions'].map((step, index) => (
								<div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(30,42,59,0.85)', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.72)' }}>
									<div style={{ width: 32, height: 32, borderRadius: 999, background: 'rgba(245,158,11,0.16)', color: '#FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{index + 1}</div>
									<div style={{ color: '#F3F4F6', fontWeight: 700 }}>{step}</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="portfolio-stats" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
					<div className="stat-card"><h4>Total Earned Commissions</h4><div className="stat-value" style={{ color: '#10B981' }}>{money(totals.totalEarned)}</div></div>
					<div className="stat-card"><h4>Pending Earnings</h4><div className="stat-value" style={{ color: '#FBBF24' }}>{money(totals.pending)}</div></div>
					<div className="stat-card"><h4>Total Referrals Invited</h4><div className="stat-value" style={{ color: '#93C5FD' }}>{totals.invited}</div></div>
					<div className="stat-card"><h4>Current Affiliate Tier</h4><div className="stat-value" style={{ color: '#A78BFA' }}>{totals.tier.label}</div><p style={{ marginTop: 8, color: '#8899AA', fontSize: 12 }}>{totals.tier.rate} commission rate</p></div>
				</div>

				<div className="assets-section">
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
						<h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} color="#38BDF8" /> Detailed Referral Performance</h3>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
							<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invited users..." style={{ width: 240, background: 'rgba(17,24,39,0.94)', border: '1px solid rgba(30,42,59,0.9)', color: '#F3F4F6', borderRadius: 12, padding: '12px 14px', outline: 'none' }} />
							<button type="button" onClick={claimEarnings} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.12)', color: '#86EFAC', cursor: 'pointer', fontWeight: 700 }}><Wallet size={15} /> Claim Earnings</button>
						</div>
					</div>

					<div className="orders-table">
						<table>
							<thead>
								<tr>
									<th>Referred User / ID</th>
									<th>Date Joined</th>
									<th>Tier Level</th>
									<th>Trading Volume ($)</th>
									<th>Commission Earned ($)</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{filteredReferrals.length === 0 ? (
									<tr><td colSpan="6" className="empty-state">No invited users matched your search.</td></tr>
								) : filteredReferrals.map((row) => (
									<tr key={row.id}>
										<td><div style={{ display: 'grid', gap: 3 }}><span style={{ color: '#F3F4F6', fontWeight: 700 }}>{row.name}</span><span style={{ color: '#8DA2BD', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{row.id}</span></div></td>
										<td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{new Date(row.joinedAt).toLocaleDateString()}</td>
										<td><span className="status-badge filled" style={{ background: 'rgba(56,189,248,0.12)', color: '#93C5FD', borderColor: 'rgba(56,189,248,0.28)' }}>{row.tier}</span></td>
										<td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{money(row.volume)}</td>
										<td style={{ color: '#10B981', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{money(row.commission)}</td>
										<td><span className="status-badge filled" style={row.status === 'Active' ? {} : { background: 'rgba(245,158,11,0.14)', color: '#FCD34D', borderColor: 'rgba(245,158,11,0.3)' }}>{row.status}</span></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}