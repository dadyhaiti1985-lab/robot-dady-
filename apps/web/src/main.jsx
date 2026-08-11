/*
 * PROPRIETARY INTELLECTUAL PROPERTY NOTICE
 * ORACLE TRADER PRO / DADY DESTIN — ALL RIGHTS RESERVED.
 * Unauthorized deployment, copying, or execution is prohibited.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { cleanupCookies, trimAuthToken, blockHostingerTracking } from '@/utils/cookieCleanup';

// Block analytics tracking FIRST to prevent large header accumulation
blockHostingerTracking();
// Run cleanup before mounting to prevent HTTP 431 errors
cleanupCookies();
trimAuthToken();

ReactDOM.createRoot(document.getElementById('root')).render(
	<App />
);
