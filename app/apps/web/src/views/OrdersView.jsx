import React from 'react';
import './ViewStyles.css';

const ORDERS = [
  { id: 1, symbol: 'BTC/USD', side: 'BUY', quantity: 0.5, price: 66800, status: 'FILLED', time: '14:32:10' },
  { id: 2, symbol: 'ETH/USD', side: 'SELL', quantity: 5, price: 3480, status: 'OPEN', time: '14:28:05' },
  { id: 3, symbol: 'XAU/USD', side: 'BUY', quantity: 1, price: 2310, status: 'CANCELED', time: '13:55:22' },
];

export default function OrdersView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Orders</h1>
        <p>View all open, filled, and canceled orders</p>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Side</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((order) => (
              <tr key={order.id}>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", color: '#10b981', fontWeight: 600 }}>{order.symbol}</td>
                <td className={order.side.toLowerCase()}>{order.side}</td>
                <td>{order.quantity}</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>${order.price.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                </td>
                <td style={{ color: '#4B5E74', fontFamily: "'JetBrains Mono', monospace" }}>{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
