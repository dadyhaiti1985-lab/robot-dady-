# SESSION_JOURNAL.md (rotated - earlier entries trimmed)

pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.717352,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-10 23:47:43.396Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.758792,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-10 23:47:43.438Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.253246,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-10 23:47:58.365Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-10 23:47:58.365Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-10 23:48:09.757Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-10 23:48:09.757Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-10 23:48:09.780Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC%2FUSD&interval=300&limit=48
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 15

## 2026-08-10 23:48:09.780Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC%2FUSD
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 15

## 2026-08-10 23:48:09.780Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC%2FUSD&interval=300&limit=48: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-10 23:48:09.781Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC%2FUSD: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-10 23:48:09.782Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- message: signal is aborted without reason
- durationMs: 1

## 2026-08-10 23:48:09.782Z console.error
- text: 
    Failed to load candles: Error: Session expired. Please sign in again.
        at http://localhost:3000/src/views/TradingView.jsx:66:15

## 2026-08-10 23:48:09.788Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 6

## 2026-08-10 23:48:09.788Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-10 23:48:09.788Z console.error
- text: 
    Failed to load positions: Error: Session expired. Please sign in again.
        at http://localhost:3000/src/views/TradingView.jsx:102:15

## 2026-08-10 23:48:09.771Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.466399,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-10 23:48:09.775Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.335259,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-10 23:48:09.784Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.391925,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-10 23:48:17.508Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Analysis"}

## 2026-08-10 23:48:17.508Z navigate
- url: http://localhost:3000/dashboard#analysis
- via: pushState

## 2026-08-10 23:48:20.227Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Signals"}

## 2026-08-10 23:48:20.228Z navigate
- url: http://localhost:3000/dashboard#signals
- via: pushState

## 2026-08-10 23:48:39.834Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 7

## 2026-08-10 23:48:39.834Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-10 23:48:39.837Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 3

## 2026-08-10 23:48:39.837Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-10 23:48:39.832Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.360242,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-10 23:48:39.836Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.34458,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-10 23:51:13.037Z console.warn
- text: [Perf] Low FPS detected: 1

## 2026-08-10 23:51:16.218Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-10 23:51:16.219Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-10 23:51:17.956Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Signals"}

## 2026-08-10 23:51:17.957Z navigate
- url: http://localhost:3000/dashboard#signals
- via: pushState

## 2026-08-10 23:51:20.217Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Execute Trade"}

## 2026-08-10 23:51:20.233Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/ai-signals/execute
- status: 401
- statusText: Unauthorized
- requestBody: {"signal":{"pair":"BTC/USD","type":"buy","confidence":"92","entryPrice":"67200","stopLoss":"65800","takeProfit":"70500","quantity":"0.01","candleTime":"2026-08-10T23:51:20.217Z"}}
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 16

## 2026-08-10 23:51:20.233Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ai-signals/execute: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-10 23:51:20.231Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.868662,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-10 23:51:24.439Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Dashboard"}

## 2026-08-10 23:51:24.439Z navigate
- url: http://localhost:3000/dashboard
- via: pushState

## 2026-08-10 23:51:24.636Z console.warn
- text: [Perf] Worker took 137.9ms (target <50ms)

## 2026-08-10 23:52:39.853Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 6

## 2026-08-10 23:52:39.853Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-10 23:52:39.858Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 4

## 2026-08-10 23:52:39.858Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-10 23:52:39.853Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.342428,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-10 23:52:39.856Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.925292,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-10 23:57:40.724Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":5.065198,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-10 23:57:40.730Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.320158,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-10 23:57:40.727Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 11

## 2026-08-10 23:57:40.727Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-10 23:57:40.764Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 37

## 2026-08-10 23:57:40.765Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-11 00:01:36.387Z console.warn
- text: [Perf] Worker took 55.1ms (target <50ms)

## 2026-08-11 00:02:51.235Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":2.095516,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-11 00:02:51.242Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.327541,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 00:02:51.238Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 14

## 2026-08-11 00:02:51.238Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-11 00:02:51.275Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 36

## 2026-08-11 00:02:51.275Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-11 01:23:32.463Z console.warn
- text: [Perf] Worker took 102.6ms (target <50ms)

## 2026-08-11 01:38:41.442Z console.warn
- text: [Perf] Worker took 96.0ms (target <50ms)

## 2026-08-11 09:47:47.351Z console.warn
- text: [Perf] Worker took 5186.9ms (target <50ms)

## 2026-08-11 09:48:40.544Z console.warn
- text: [Perf] Low FPS detected: 51

## 2026-08-11 09:48:44.858Z load
- url: http://localhost:3000/dashboard

## 2026-08-11 09:48:45.787Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 266

## 2026-08-11 09:48:45.787Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/bot/status
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 268

## 2026-08-11 09:48:45.787Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/trades
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 268

## 2026-08-11 09:48:45.822Z console.warn
- text: [Perf] Worker took 333.5ms (target <50ms)

## 2026-08-11 09:48:45.828Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-11 09:48:45.829Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 401
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 09:48:45.829Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/bot/status: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-11 09:48:45.830Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/trades: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-11 09:48:45.830Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- message: signal is aborted without reason
- durationMs: 1

## 2026-08-11 09:48:45.873Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 43

## 2026-08-11 09:48:45.873Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-11 09:48:46.245Z console.warn
- text: [Perf] Low FPS detected: 34

## 2026-08-11 09:48:46.385Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 401
- statusText: Unauthorized
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 10

## 2026-08-11 09:48:46.385Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-11 09:48:46.391Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 6

## 2026-08-11 09:48:46.391Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-11 09:48:45.659Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":2.333411,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-11 09:48:45.659Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":1.290028,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-11 09:48:45.662Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":3.885934,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-11 09:48:45.839Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.420062,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:48:45.841Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.926285,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:48:46.380Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.391657,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-11 09:48:46.390Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":2.213647,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:48:49.892Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" START AI TRADING"}

## 2026-08-11 09:48:49.938Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/bot/toggle
- status: 401
- statusText: Unauthorized
- requestBody: {"botActive":"true"}
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 46

## 2026-08-11 09:48:49.940Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/bot/toggle: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-11 09:48:49.950Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 10

## 2026-08-11 09:48:49.950Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-11 09:48:49.906Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.395459,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-11 09:48:49.943Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.311453,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:48:53.432Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" START AI TRADING"}

## 2026-08-11 09:48:53.473Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/bot/toggle
- status: 401
- statusText: Unauthorized
- requestBody: {"botActive":"true"}
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 42

## 2026-08-11 09:48:53.474Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/bot/toggle: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-11 09:48:53.482Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 8

## 2026-08-11 09:48:53.482Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-11 09:48:54.437Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" START AI TRADING"}

## 2026-08-11 09:48:54.475Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/bot/toggle
- status: 401
- statusText: Unauthorized
- requestBody: {"botActive":"true"}
- response: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}
- durationMs: 38

## 2026-08-11 09:48:54.475Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/bot/toggle: {"error":"Session expired. Please sign in again.","code":"INVALID_TOKEN"}

## 2026-08-11 09:48:54.482Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh
- status: 401
- statusText: Unauthorized
- response: 
    {"data":{},"message":"The request requires valid record authorization token.","status":401}
    
- durationMs: 8

## 2026-08-11 09:48:54.483Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/auth-refresh: {"data":{},"message":"The request requires valid record authorization token.","status":401}
    

## 2026-08-11 09:48:55.604Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%AI LIVE12ms99.9%ENTraderOracle AI EngineACTIVE Market ConnectedScanning Global Markets...AI Confidence90%Opportunity67%Risk LevelMediumSentimentBullishAI RecommendationSTRONG BUY — BTC/USDTarget: $71,200 · SL: $65,800 · R/R: 1:2.8HIGH CONFIDENCE START AI TRADINGExecuting StrategyLive Market OverviewallcryptoindexforexcommodityBTBTC/USDBitcoin+2.31%$67,366Vol: 42.1BHighAnalyzeETETH/USDEthereum+1.79%$3,513Vol: 18.3BMedAnalyzeSOSOL/USDSolana+4.11%$182.29Vol: 5.2BHighAnalyzeXRXRP/USDXRP-0.85%$0.6278Vol: 2.1BMedAnalyzeBNBNB/USDBNB+0.63%$418.33Vol: 1.4BLowAnalyzeNANASDAQNASDAQ-0.41%$19,139Vol: 8.9BLowAnalyzeS&S&P500S&P 500+0.24%$5,427Vol: 12.1BLowAnalyzeGOGOLDGold+0.36%$2,342Vol: 3.2BLowAnalyzeEUEUR/USDEuro-0.15%$1.0844Vol: 6.4BLowAnalyzeGBGBP/USDPound+0.29%$1.2635Vol: 2.8BLowAnalyzeUSUSD/JPYDollar/Yen-0.19%$156.57Vol: 4.1BMedAnalyzeBTC/USD+2.3%1m5m15m1H4H1D1W1MEMA 9EMA 21RSIMACDVWAPBBAI Analysis PanelLIVE86%AI Confidence ScoreStrong BuyBTC/USD — 4H timeframeBullish Score67.63084033163385%Bearish Score28%Buy Probability80.32579008377405%Sell Probability19%Trend Strength78%Market Volatility17%Momentum45%Liquidity85%Institutional64%Expected Move3.2% Bulls 68% Bears 32%Trade ExecutionBTC/USD · $67,245AssetBTC/USDETH/USDSOL/USDXRP/USDBNB/USDGOLDEUR/USDGBP/USDCurrent Price$67,245Spread$12.4Order TypeMarketLimitStopStop-LimitLeverage1x2x5x10x20x50x100xLot SizeRisk %Take ProfitStop LossMargin: $67.25Risk: $13.45 BUY SELLAI SignalsUpdated 5:48:45 AMAssetSignalConf.TFRiskTargetStop LossEst. ProfitStatusBTC/USDBUY87%4HLow71,20065,800+8.4%ActiveETH/USDBUY74%1DMed3,8503,320+9.6%ActiveSOL/USDSELL62%4HHigh165.00195.00+9.5%PendingGOLDBUY78%1DLow2,3902,295+2.1%ActiveEUR/USDSELL55%1HLow1.071.09+0.85%PendingGBP/USDHOLD51%4HMed1.271.26+0.62%WatchXRP/USDBUY69%1DHigh0.72000.5900+14.6%ActiveNASDAQHOLD58%1DLow19,50018,800+1.9%W..."}

## 2026-08-11 09:48:53.437Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":1.550845,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-11 09:48:53.476Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.312608,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:48:54.441Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.313177,"method":"POST","referer":"","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"node","userIP":"127.0.0.1"}

## 2026-08-11 09:48:54.477Z pocketbase.error
- message: POST /api/collections/users/auth-refresh
- data: {"auth":"","details":null,"error":"The request requires valid record authorization token.","execTime":0.317112,"method":"POST","referer":"http://localhost:3000/dashboard","remoteIP":"127.0.0.1","status":401,"type":"request","url":"/api/collections/users/auth-refresh","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:48:58.177Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI LIVE12ms99.9%ENTrader"}

## 2026-08-11 09:48:59.931Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI LIVE12ms99.9%ENTrader"}

## 2026-08-11 09:49:01.488Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trader"}

## 2026-08-11 09:49:08.222Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" Sign Out"}

## 2026-08-11 09:49:08.264Z navigate
- url: http://localhost:3000/login
- via: replaceState

## 2026-08-11 09:49:08.382Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"","valueLength":0,"text":""}

## 2026-08-11 09:49:08.384Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:49:08.384Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:49:08.384Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"login-password","placeholder":"••••••••","label":"password","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 09:49:08.385Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"login-password","placeholder":"••••••••","label":"password","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:49:08.385Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"login-password","placeholder":"••••••••","label":"password","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:49:10.247Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"submit","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Konekte (Login)"}

## 2026-08-11 09:49:10.250Z submit
- action: http://localhost:3000/login
- fields: [{"label":"email","type":"email","value":"dadyhaiti1985@gmail.com","length":23,"redacted":false},{"label":"password","type":"password","value":"[redacted:length=14]","length":14,"redacted":true},{"label":"[submit]","type":"submit","value":"","length":0,"redacted":false}]

## 2026-08-11 09:49:10.273Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-with-password
- status: 400
- statusText: Bad Request
- requestBody: {"identity":"dadyhaiti1985@gmail.com","password":"[redacted:length=14]"}
- response: 
    {"data":{},"message":"Failed to authenticate.","status":400}
    
- durationMs: 23

## 2026-08-11 09:49:10.273Z console.error
- text: [AuthContext] Login failed: {"status":400,"message":"Failed to authenticate.","response":{"data":{},"message":"Failed to authenticate.","status":400},"isAbort":false}

## 2026-08-11 09:49:10.272Z pocketbase.error
- message: POST /api/collections/users/auth-with-password
- data: {"auth":"","details":"invalid login credentials","error":"Failed to authenticate.","execTime":14.667617,"method":"POST","referer":"http://localhost:3000/login","remoteIP":"127.0.0.1","status":400,"type":"request","url":"/api/collections/users/auth-with-password","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:49:13.910Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:49:13.997Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:49:15.112Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:49:17.352Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:49:17.352Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"login-password","placeholder":"••••••••","label":"password","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:49:17.431Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"login-password","placeholder":"••••••••","label":"password","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:49:26.634Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"submit","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Konekte (Login)"}

## 2026-08-11 09:49:26.634Z submit
- action: http://localhost:3000/login
- fields: [{"label":"email","type":"email","value":"dadyhaiti1985@gmail.com","length":23,"redacted":false},{"label":"password","type":"password","value":"[redacted:length=14]","length":14,"redacted":true},{"label":"[submit]","type":"submit","value":"","length":0,"redacted":false}]

## 2026-08-11 09:49:26.636Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"login-password","placeholder":"••••••••","label":"password","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:49:26.646Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/auth-with-password
- status: 400
- statusText: Bad Request
- requestBody: {"identity":"dadyhaiti1985@gmail.com","password":"[redacted:length=14]"}
- response: 
    {"data":{},"message":"Failed to authenticate.","status":400}
    
- durationMs: 11

## 2026-08-11 09:49:26.646Z console.error
- text: [AuthContext] Login failed: {"status":400,"message":"Failed to authenticate.","response":{"data":{},"message":"Failed to authenticate.","status":400},"isAbort":false}

## 2026-08-11 09:49:26.639Z pocketbase.error
- message: POST /api/collections/users/auth-with-password
- data: {"auth":"","details":"invalid login credentials","error":"Failed to authenticate.","execTime":1.44684,"method":"POST","referer":"http://localhost:3000/login","remoteIP":"127.0.0.1","status":400,"type":"request","url":"/api/collections/users/auth-with-password","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:49:33.634Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Enskri isit la"}

## 2026-08-11 09:49:33.635Z navigate
- url: http://localhost:3000/signup
- via: pushState

## 2026-08-11 09:49:35.110Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"signup-email","placeholder":"jan@ekzanp.com","label":"email","value":"","valueLength":0,"text":""}

## 2026-08-11 09:49:35.205Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"signup-email","placeholder":"jan@ekzanp.com","label":"email","value":"","valueLength":0,"text":""}

## 2026-08-11 09:49:36.164Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"signup-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:49:36.752Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"signup-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:49:36.752Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"signup-password","placeholder":"••••••••","label":"password","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 09:49:36.863Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"signup-password","placeholder":"••••••••","label":"password","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 09:49:44.860Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"signup-password","placeholder":"••••••••","label":"password","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:49:44.860Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"signup-password","placeholder":"••••••••","label":"password","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:49:44.861Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"passwordConfirm","type":"password","id":"signup-passwordConfirm","placeholder":"••••••••","label":"passwordConfirm","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 09:49:44.987Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"passwordConfirm","type":"password","id":"signup-passwordConfirm","placeholder":"••••••••","label":"passwordConfirm","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 09:49:50.797Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"passwordConfirm","type":"password","id":"signup-passwordConfirm","placeholder":"••••••••","label":"passwordConfirm","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:49:50.797Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"submit","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Enskri (Sign up)"}

## 2026-08-11 09:49:50.798Z submit
- action: http://localhost:3000/signup
- fields: [{"label":"email","type":"email","value":"dadyhaiti1985@gmail.com","length":23,"redacted":false},{"label":"password","type":"password","value":"[redacted:length=14]","length":14,"redacted":true},{"label":"passwordConfirm","type":"password","value":"[redacted:length=14]","length":14,"redacted":true},{"label":"[submit]","type":"submit","value":"","length":0,"redacted":false}]

## 2026-08-11 09:49:50.799Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"passwordConfirm","type":"password","id":"signup-passwordConfirm","placeholder":"••••••••","label":"passwordConfirm","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:49:50.983Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/records
- status: 400
- statusText: Bad Request
- requestBody: {"email":"dadyhaiti1985@gmail.com","password":"[redacted:length=14]","passwordConfirm":"[redacted:length=14]","emailVisibility":"true"}
- response: 
    {"data":{},"message":"Failed to create record.","status":400}
    
- durationMs: 185

## 2026-08-11 09:49:50.983Z console.error
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/records: {"data":{},"message":"Failed to create record.","status":400}
    

## 2026-08-11 09:49:50.983Z console.error
- text: [Signup] Full error: {"data":{},"message":"Failed to create record.","status":400}

## 2026-08-11 09:49:50.982Z pocketbase.error
- message: POST /api/collections/users/records
- data: {"auth":"","details":"TypeError: Object has no member 'dao' at /Users/macbook/Desktop/robot trade /apps/pocketbase/pb.js:12:11(50)","error":"Failed to create record.","execTime":180.010716,"method":"POST","referer":"http://localhost:3000/signup","remoteIP":"127.0.0.1","status":400,"type":"request","url":"/api/collections/users/records","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:49:55.594Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"submit","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Enskri (Sign up)"}

## 2026-08-11 09:49:55.594Z submit
- action: http://localhost:3000/signup
- fields: [{"label":"email","type":"email","value":"dadyhaiti1985@gmail.com","length":23,"redacted":false},{"label":"password","type":"password","value":"[redacted:length=14]","length":14,"redacted":true},{"label":"passwordConfirm","type":"password","value":"[redacted:length=14]","length":14,"redacted":true},{"label":"[submit]","type":"submit","value":"","length":0,"redacted":false}]

## 2026-08-11 09:49:55.727Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/records
- status: 400
- statusText: Bad Request
- requestBody: {"email":"dadyhaiti1985@gmail.com","password":"[redacted:length=14]","passwordConfirm":"[redacted:length=14]","emailVisibility":"true"}
- response: 
    {"data":{"email":{"code":"validation_not_unique","message":"Value must be unique."}},"message":"Failed to create record.","status":400}
    
- durationMs: 133

## 2026-08-11 09:49:55.727Z console.warn
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/records: {"data":{"email":{"code":"validation_not_unique","message":"Value must be unique."}},"message":"Failed to create record.","status":400}
    

## 2026-08-11 09:49:55.728Z console.error
- text: [Signup] Full error: {"data":{"email":{"code":"validation_not_unique","message":"Value must be unique."}},"message":"Failed to create record.","status":400}

## 2026-08-11 09:49:56.736Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"submit","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Enskri (Sign up)"}

## 2026-08-11 09:49:56.736Z submit
- action: http://localhost:3000/signup
- fields: [{"label":"email","type":"email","value":"dadyhaiti1985@gmail.com","length":23,"redacted":false},{"label":"password","type":"password","value":"[redacted:length=14]","length":14,"redacted":true},{"label":"passwordConfirm","type":"password","value":"[redacted:length=14]","length":14,"redacted":true},{"label":"[submit]","type":"submit","value":"","length":0,"redacted":false}]

## 2026-08-11 09:49:56.864Z network.error
- method: POST
- url: http://localhost:3000/hcgi/platform/api/collections/users/records
- status: 400
- statusText: Bad Request
- requestBody: {"email":"dadyhaiti1985@gmail.com","password":"[redacted:length=14]","passwordConfirm":"[redacted:length=14]","emailVisibility":"true"}
- response: 
    {"data":{"email":{"code":"validation_not_unique","message":"Value must be unique."}},"message":"Failed to create record.","status":400}
    
- durationMs: 127

## 2026-08-11 09:49:56.864Z console.warn
- text: 
    Fetch error from http://localhost:3000/hcgi/platform/api/collections/users/records: {"data":{"email":{"code":"validation_not_unique","message":"Value must be unique."}},"message":"Failed to create record.","status":400}
    

## 2026-08-11 09:49:56.864Z console.error
- text: [Signup] Full error: {"data":{"email":{"code":"validation_not_unique","message":"Value must be unique."}},"message":"Failed to create record.","status":400}

## 2026-08-11 09:49:55.726Z pocketbase.error
- message: POST /api/collections/users/records
- data: {"auth":"","details":{"data":{"email":"Value must be unique"},"raw":"email: Value must be unique."},"error":"Failed to create record.","execTime":127.840511,"method":"POST","referer":"http://localhost:3000/signup","remoteIP":"127.0.0.1","status":400,"type":"request","url":"/api/collections/users/records","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:49:56.863Z pocketbase.error
- message: POST /api/collections/users/records
- data: {"auth":"","details":{"data":{"email":"Value must be unique"},"raw":"email: Value must be unique."},"error":"Failed to create record.","execTime":123.198325,"method":"POST","referer":"http://localhost:3000/signup","remoteIP":"127.0.0.1","status":400,"type":"request","url":"/api/collections/users/records","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36","userIP":"127.0.0.1"}

## 2026-08-11 09:50:01.503Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Konekte isit la"}

## 2026-08-11 09:50:01.504Z navigate
- url: http://localhost:3000/login
- via: pushState

## 2026-08-11 09:50:01.619Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"","valueLength":0,"text":""}

## 2026-08-11 09:50:01.620Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:50:01.620Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"email","type":"email","id":"login-email","placeholder":"jan@ekzanp.com","label":"email","value":"dadyhaiti1985@gmail.com","valueLength":23,"text":""}

## 2026-08-11 09:50:01.620Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"login-password","placeholder":"••••••••","label":"password","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 09:50:01.620Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"login-password","placeholder":"••••••••","label":"password","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:50:01.621Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"password","type":"password","id":"login-password","placeholder":"••••••••","label":"password","value":"[redacted:length=14]","valueLength":14,"text":""}

## 2026-08-11 09:50:02.754Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"submit","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Konekte (Login)"}

## 2026-08-11 09:50:02.755Z submit
- action: http://localhost:3000/login
- fields: [{"label":"email","type":"email","value":"dadyhaiti1985@gmail.com","length":23,"redacted":false},{"label":"password","type":"password","value":"[redacted:length=14]","length":14,"redacted":true},{"label":"[submit]","type":"submit","value":"","length":0,"redacted":false}]

## 2026-08-11 09:50:02.833Z navigate
- url: http://localhost:3000/dashboard
- via: replaceState

## 2026-08-11 09:50:03.026Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 200

## 2026-08-11 09:50:03.027Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 09:50:03.027Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 09:50:03.029Z console.warn
- text: [Perf] Worker took 102.0ms (target <50ms)

## 2026-08-11 09:50:03.572Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 400
- statusText: Bad Request
- response: {"success":false,"error":"API credentials not configured. Please add your Coinbase API keys in the dashboard.","code":"NO_CREDENTIALS"}
- durationMs: 14

## 2026-08-11 09:50:03.573Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"success":false,"error":"API credentials not configured. Please add your Coinbase API keys in the dashboard.","code":"NO_CREDENTIALS"}

## 2026-08-11 09:50:03.882Z console.warn
- text: [Perf] Low FPS detected: 53

## 2026-08-11 09:50:05.956Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" START AI TRADING"}

## 2026-08-11 09:50:06.004Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/bot/toggle
- status: 400
- statusText: Bad Request
- requestBody: {"botActive":"true"}
- response: {"success":false,"code":"NO_CREDENTIALS","error":"API credentials not configured. Please add your Coinbase API keys in Settings before starting the bot."}
- durationMs: 47

## 2026-08-11 09:50:06.004Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/bot/toggle: {"success":false,"code":"NO_CREDENTIALS","error":"API credentials not configured. Please add your Coinbase API keys in Settings before starting the bot."}

## 2026-08-11 09:51:10.549Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 400
- statusText: Bad Request
- response: {"success":false,"error":"API credentials not configured. Please add your Coinbase API keys in the dashboard.","code":"NO_CREDENTIALS"}
- durationMs: 194

## 2026-08-11 09:51:10.555Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"success":false,"error":"API credentials not configured. Please add your Coinbase API keys in the dashboard.","code":"NO_CREDENTIALS"}

## 2026-08-11 09:55:11.809Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 400
- statusText: Bad Request
- response: {"success":false,"error":"API credentials not configured. Please add your Coinbase API keys in the dashboard.","code":"NO_CREDENTIALS"}
- durationMs: 53

## 2026-08-11 09:55:11.809Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"success":false,"error":"API credentials not configured. Please add your Coinbase API keys in the dashboard.","code":"NO_CREDENTIALS"}

## 2026-08-11 09:56:07.963Z console.warn
- text: [Perf] Worker took 108.8ms (target <50ms)

## 2026-08-11 09:58:33.243Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" BUY"}

## 2026-08-11 09:58:34.224Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" BUY"}

## 2026-08-11 09:58:34.426Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" BUY"}

## 2026-08-11 09:58:34.644Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" BUY"}

## 2026-08-11 09:59:18.513Z click
- element: {"tag":"button","role":null,"ariaLabel":"Open AI Assistant","name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":""}

## 2026-08-11 09:59:18.547Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"","valueLength":0,"text":""}

## 2026-08-11 09:59:20.187Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"What is my win rate?"}

## 2026-08-11 09:59:20.411Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/integrated-ai/stream
- status: 500
- statusText: Internal Server Error
- requestBody: {"message":"[{\"text\":\"Please respond in English. [USER TRADING CONTEXT]\\nBalance: $0.00\\nBot Status: INACTIVE\\nTotal Trades: 0\\nWin Rate: 0%\\nTotal P&L: $0.00\\nRecent Trades (last 5): None\\n[/USER TRADING CONTEXT]\\n\\nWhat is my win rate?\",\"type\":\"text\"}]"}
- response: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}
- durationMs: 220

## 2026-08-11 09:59:20.411Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/integrated-ai/stream: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}

## 2026-08-11 09:59:22.429Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/integrated-ai/stream
- status: 500
- statusText: Internal Server Error
- requestBody: {"message":"[{\"text\":\"Please respond in English. [USER TRADING CONTEXT]\\nBalance: $0.00\\nBot Status: INACTIVE\\nTotal Trades: 0\\nWin Rate: 0%\\nTotal P&L: $0.00\\nRecent Trades (last 5): None\\n[/USER TRADING CONTEXT]\\n\\nWhat is my win rate?\",\"type\":\"text\"}]"}
- response: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}
- durationMs: 13

## 2026-08-11 09:59:22.429Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/integrated-ai/stream: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}

## 2026-08-11 09:59:26.454Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/integrated-ai/stream
- status: 500
- statusText: Internal Server Error
- requestBody: {"message":"[{\"text\":\"Please respond in English. [USER TRADING CONTEXT]\\nBalance: $0.00\\nBot Status: INACTIVE\\nTotal Trades: 0\\nWin Rate: 0%\\nTotal P&L: $0.00\\nRecent Trades (last 5): None\\n[/USER TRADING CONTEXT]\\n\\nWhat is my win rate?\",\"type\":\"text\"}]"}
- response: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}
- durationMs: 24

## 2026-08-11 09:59:26.454Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/integrated-ai/stream: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}

## 2026-08-11 09:59:35.907Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" BUY"}

## 2026-08-11 09:59:36.587Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" SELL"}

## 2026-08-11 09:59:51.821Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" BUY"}

## 2026-08-11 09:59:53.504Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" SELL"}

## 2026-08-11 09:59:54.544Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" SELL"}

## 2026-08-11 09:59:55.263Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" BUY"}

## 2026-08-11 10:00:08.726Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" START AI TRADING"}

## 2026-08-11 10:00:08.776Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/bot/toggle
- status: 400
- statusText: Bad Request
- requestBody: {"botActive":"true"}
- response: {"success":false,"code":"NO_CREDENTIALS","error":"API credentials not configured. Please add your Coinbase API keys in Settings before starting the bot."}
- durationMs: 49

## 2026-08-11 10:00:08.776Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/bot/toggle: {"success":false,"code":"NO_CREDENTIALS","error":"API credentials not configured. Please add your Coinbase API keys in Settings before starting the bot."}

## 2026-08-11 10:00:11.830Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 400
- statusText: Bad Request
- response: {"success":false,"error":"API credentials not configured. Please add your Coinbase API keys in the dashboard.","code":"NO_CREDENTIALS"}
- durationMs: 13

## 2026-08-11 10:00:11.830Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"success":false,"error":"API credentials not configured. Please add your Coinbase API keys in the dashboard.","code":"NO_CREDENTIALS"}

## 2026-08-11 10:00:14.124Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Settings"}

## 2026-08-11 10:00:14.126Z navigate
- url: http://localhost:3000/dashboard#settings
- via: pushState

## 2026-08-11 10:00:17.066Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Manage API Keys"}

## 2026-08-11 10:00:17.066Z navigate
- url: http://localhost:3000/oracle-trader-pro/setup
- via: pushState

## 2026-08-11 10:00:18.638Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"password","id":"setup-api-key","placeholder":"Minimum 20 karaktè","label":"apiKey","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:00:18.734Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"password","id":"setup-api-key","placeholder":"Minimum 20 karaktè","label":"apiKey","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:00:50.105Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"password","id":"setup-api-key","placeholder":"Minimum 20 karaktè","label":"apiKey","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:00:50.119Z console.warn
- text: [Perf] Low FPS detected: 1

## 2026-08-11 10:00:51.574Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"password","id":"setup-api-key","placeholder":"Minimum 20 karaktè","label":"apiKey","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:00:55.180Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"password","id":"setup-api-key","placeholder":"Minimum 20 karaktè","label":"apiKey","value":"[redacted:length=95]","valueLength":95,"text":""}

## 2026-08-11 10:00:55.180Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"password","id":"setup-api-key","placeholder":"Minimum 20 karaktè","label":"apiKey","value":"[redacted:length=95]","valueLength":95,"text":""}

## 2026-08-11 10:00:55.180Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiSecret","type":"password","id":"setup-api-secret","placeholder":"Minimum 20 karaktè","label":"apiSecret","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:00:55.250Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiSecret","type":"password","id":"setup-api-secret","placeholder":"Minimum 20 karaktè","label":"apiSecret","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:01:04.583Z console.warn
- text: [Perf] Low FPS detected: 7

## 2026-08-11 10:01:04.584Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiSecret","type":"password","id":"setup-api-secret","placeholder":"Minimum 20 karaktè","label":"apiSecret","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:01:06.525Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiSecret","type":"password","id":"setup-api-secret","placeholder":"Minimum 20 karaktè","label":"apiSecret","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:01:09.096Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiSecret","type":"password","id":"setup-api-secret","placeholder":"Minimum 20 karaktè","label":"apiSecret","value":"[redacted:length=232]","valueLength":232,"text":""}

## 2026-08-11 10:01:09.096Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiSecret","type":"password","id":"setup-api-secret","placeholder":"Minimum 20 karaktè","label":"apiSecret","value":"[redacted:length=232]","valueLength":232,"text":""}

## 2026-08-11 10:01:09.228Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"submit","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" SOVE & ANREJISTRE API KEYS"}

## 2026-08-11 10:01:09.229Z submit
- action: http://localhost:3000/oracle-trader-pro/setup
- fields: [{"label":"[button]","type":"button","value":"","length":0,"redacted":false},{"label":"exchange","type":"select-one","value":"Coinbase","length":8,"redacted":false},{"label":"maxRisk","type":"number","value":"2","length":1,"redacted":false},{"label":"apiKey","type":"password","value":"[redacted:length=95]","length":95,"redacted":true},{"label":"[button]","type":"button","value":"","length":0,"redacted":false},{"label":"apiSecret","type":"password","value":"[redacted:length=232]","length":232,"redacted":true},{"label":"[button]","type":"button","value":"","length":0,"redacted":false},{"label":"stopLoss","type":"number","value":"2","length":1,"redacted":false},{"label":"takeProfit","type":"number","value":"5","length":1,"redacted":false},{"label":"[submit]","type":"submit","value":"","length":0,"redacted":false}]

## 2026-08-11 10:01:10.082Z navigate
- url: http://localhost:3000/dashboard
- via: pushState

## 2026-08-11 10:01:10.298Z console.warn
- text: [Perf] Worker took 175.0ms (target <50ms)

## 2026-08-11 10:01:10.622Z console.warn
- text: [Perf] Low FPS detected: 52

## 2026-08-11 10:01:10.829Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 400
- statusText: Bad Request
- response: {"success":false,"error":"Your stored API credentials appear corrupted. Please re-enter your Coinbase API credentials.","code":"INVALID_CREDENTIALS","detail":"All parse formats failed"}
- durationMs: 35

## 2026-08-11 10:01:10.829Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: {"success":false,"error":"Your stored API credentials appear corrupted. Please re-enter your Coinbase API credentials.","code":"INVALID_CREDENTIALS","detail":"All parse formats failed"}

## 2026-08-11 10:01:11.642Z console.warn
- text: [Perf] Low FPS detected: 43

## 2026-08-11 10:01:15.414Z focus
- element: {"tag":"textarea","role":null,"ariaLabel":null,"name":"apiSecret","type":null,"id":"cred-modal-api-secret","placeholder":"-----BEGIN EC PRIVATE KEY-----\nMHcCAQEE... (paste full key here)\n-----END EC PRIVATE KEY-----","label":"apiSecret","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:01:15.484Z click
- element: {"tag":"textarea","role":null,"ariaLabel":null,"name":"apiSecret","type":null,"id":"cred-modal-api-secret","placeholder":"-----BEGIN EC PRIVATE KEY-----\nMHcCAQEE... (paste full key here)\n-----END EC PRIVATE KEY-----","label":"apiSecret","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:01:18.689Z console.warn
- text: [Perf] Low FPS detected: 52

## 2026-08-11 10:01:18.865Z change
- element: {"tag":"textarea","role":null,"ariaLabel":null,"name":"apiSecret","type":null,"id":"cred-modal-api-secret","placeholder":"-----BEGIN EC PRIVATE KEY-----\nMHcCAQEE... (paste full key here)\n-----END EC PRIVATE KEY-----","label":"apiSecret","value":"[redacted:length=232]","valueLength":232,"text":""}

## 2026-08-11 10:01:18.865Z blur
- element: {"tag":"textarea","role":null,"ariaLabel":null,"name":"apiSecret","type":null,"id":"cred-modal-api-secret","placeholder":"-----BEGIN EC PRIVATE KEY-----\nMHcCAQEE... (paste full key here)\n-----END EC PRIVATE KEY-----","label":"apiSecret","value":"[redacted:length=232]","valueLength":232,"text":""}

## 2026-08-11 10:01:18.865Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"text","id":"cred-modal-api-key","placeholder":"organizations/your-org-id/apiKeys/your-key-id","label":"apiKey","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:01:18.970Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"text","id":"cred-modal-api-key","placeholder":"organizations/your-org-id/apiKeys/your-key-id","label":"apiKey","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:01:32.747Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"text","id":"cred-modal-api-key","placeholder":"organizations/your-org-id/apiKeys/your-key-id","label":"apiKey","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:01:32.763Z console.warn
- text: [Perf] Low FPS detected: 5

## 2026-08-11 10:01:33.769Z console.warn
- text: [Perf] Low FPS detected: 40

## 2026-08-11 10:01:34.546Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"text","id":"cred-modal-api-key","placeholder":"organizations/your-org-id/apiKeys/your-key-id","label":"apiKey","value":"[redacted:length=0]","valueLength":0,"text":""}

## 2026-08-11 10:01:36.801Z console.warn
- text: [Perf] Low FPS detected: 53

## 2026-08-11 10:01:37.791Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"text","id":"cred-modal-api-key","placeholder":"organizations/your-org-id/apiKeys/your-key-id","label":"apiKey","value":"[redacted:length=95]","valueLength":95,"text":""}

## 2026-08-11 10:01:37.792Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"apiKey","type":"text","id":"cred-modal-api-key","placeholder":"organizations/your-org-id/apiKeys/your-key-id","label":"apiKey","value":"[redacted:length=95]","valueLength":95,"text":""}

## 2026-08-11 10:01:37.805Z console.warn
- text: [Perf] Low FPS detected: 54

## 2026-08-11 10:01:37.910Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Save & Retry"}

## 2026-08-11 10:01:38.806Z console.warn
- text: [Perf] Low FPS detected: 47

## 2026-08-11 10:01:52.766Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" START AI TRADING"}

## 2026-08-11 10:01:59.618Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" STOP AI TRADING"}

## 2026-08-11 10:02:24.379Z console.warn
- text: [Perf] Low FPS detected: 2

## 2026-08-11 10:02:31.385Z click
- element: {"tag":"button","role":null,"ariaLabel":"Open AI Assistant","name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":""}

## 2026-08-11 10:02:31.416Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"","valueLength":0,"text":""}

## 2026-08-11 10:02:53.678Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"","valueLength":0,"text":""}

## 2026-08-11 10:07:59.462Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"","valueLength":0,"text":""}

## 2026-08-11 10:09:25.313Z console.warn
- text: [Perf] Worker took 51.1ms (target <50ms)

## 2026-08-11 10:09:46.452Z console.error
- text: 
    Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.

## 2026-08-11 10:09:46.456Z console.error
- text: 
    Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.

## 2026-08-11 10:09:46.458Z window.error
- message: Uncaught TypeError: Cannot read properties of null (reading 'useState')
- source: http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043
- line: 1066
- col: 29
- stack: 
    TypeError: Cannot read properties of null (reading 'useState')
        at useState (http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043:1066:29)
        at AIChatWindow (http://localhost:3000/src/components/AIChatWindow.jsx?t=1786442983288:42:29)
        at renderWithHooks (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:11596:26)
        at updateFunctionComponent (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:14630:28)
        at beginWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:15972:22)
        at HTMLUnknownElement.callCallback2 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3680:22)
        at Object.invokeGuardedCallbackDev (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3705:24)
        at invokeGuardedCallback (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3739:39)
        at beginWork$1 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19818:15)
        at performUnitOfWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19251:20)

## 2026-08-11 10:09:46.558Z console.error
- text: 
    Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.

## 2026-08-11 10:09:46.558Z console.error
- text: 
    Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.

## 2026-08-11 10:09:46.558Z window.error
- message: Uncaught TypeError: Cannot read properties of null (reading 'useState')
- source: http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043
- line: 1066
- col: 29
- stack: 
    TypeError: Cannot read properties of null (reading 'useState')
        at useState (http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043:1066:29)
        at AIChatWindow (http://localhost:3000/src/components/AIChatWindow.jsx?t=1786442983288:42:29)
        at renderWithHooks (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:11596:26)
        at updateFunctionComponent (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:14630:28)
        at beginWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:15972:22)
        at HTMLUnknownElement.callCallback2 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3680:22)
        at Object.invokeGuardedCallbackDev (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3705:24)
        at invokeGuardedCallback (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3739:39)
        at beginWork$1 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19818:15)
        at performUnitOfWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19251:20)

## 2026-08-11 10:09:46.612Z console.error
- text: 
    The above error occurred in the <AIChatWindow> component:
    
        at AIChatWindow (http://localhost:3000/src/components/AIChatWindow.jsx?t=1786442983288:30:3)
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ac7c7a7a:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ac7c7a7a:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ac7c7a7a:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ac7c7a7a:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 10:09:46.802Z unhandledrejection
- message: Cannot read properties of null (reading 'useState')
- stack: 
    TypeError: Cannot read properties of null (reading 'useState')
        at useState (http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043:1066:29)
        at AIChatWindow (http://localhost:3000/src/components/AIChatWindow.jsx?t=1786442983288:42:29)
        at renderWithHooks (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:11596:26)
        at updateFunctionComponent (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:14630:28)
        at beginWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:15972:22)
        at beginWork$1 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19806:22)
        at performUnitOfWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19251:20)
        at workLoopSync (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19190:13)
        at renderRootSync (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19169:15)
        at recoverFromConcurrentError (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:18786:28)

## 2026-08-11 10:09:48.503Z root.empty
- url: http://localhost:3000/dashboard

## 2026-08-11 10:09:53.815Z console.error
- text: 
    Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.

## 2026-08-11 10:09:53.816Z console.error
- text: 
    Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.

## 2026-08-11 10:09:53.816Z window.error
- message: Uncaught TypeError: Cannot read properties of null (reading 'useState')
- source: http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043
- line: 1066
- col: 29
- stack: 
    TypeError: Cannot read properties of null (reading 'useState')
        at useState (http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043:1066:29)
        at AIChatWindow (http://localhost:3000/src/components/AIChatWindow.jsx?t=1786442983288:42:29)
        at renderWithHooks (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:11596:26)
        at mountIndeterminateComponent (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:14974:21)
        at beginWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:15962:22)
        at HTMLUnknownElement.callCallback2 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3680:22)
        at Object.invokeGuardedCallbackDev (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3705:24)
        at invokeGuardedCallback (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3739:39)
        at beginWork$1 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19818:15)
        at performUnitOfWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19251:20)

## 2026-08-11 10:09:54.114Z console.error
- text: 
    Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.

## 2026-08-11 10:09:54.114Z console.error
- text: 
    Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.

## 2026-08-11 10:09:54.114Z window.error
- message: Uncaught TypeError: Cannot read properties of null (reading 'useState')
- source: http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043
- line: 1066
- col: 29
- stack: 
    TypeError: Cannot read properties of null (reading 'useState')
        at useState (http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043:1066:29)
        at AIChatWindow (http://localhost:3000/src/components/AIChatWindow.jsx?t=1786442983288:42:29)
        at renderWithHooks (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:11596:26)
        at mountIndeterminateComponent (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:14974:21)
        at beginWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:15962:22)
        at HTMLUnknownElement.callCallback2 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3680:22)
        at Object.invokeGuardedCallbackDev (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3705:24)
        at invokeGuardedCallback (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:3739:39)
        at beginWork$1 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19818:15)
        at performUnitOfWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19251:20)

## 2026-08-11 10:09:54.115Z console.error
- text: 
    The above error occurred in the <AIChatWindow> component:
    
        at AIChatWindow (http://localhost:3000/src/components/AIChatWindow.jsx?t=1786442983288:30:3)
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ac7c7a7a:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ac7c7a7a:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ac7c7a7a:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=ac7c7a7a:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 10:09:54.116Z unhandledrejection
- message: Cannot read properties of null (reading 'useState')
- stack: 
    TypeError: Cannot read properties of null (reading 'useState')
        at useState (http://localhost:3000/node_modules/.vite/deps/chunk-JDBSQVFS.js?v=81b5d043:1066:29)
        at AIChatWindow (http://localhost:3000/src/components/AIChatWindow.jsx?t=1786442983288:42:29)
        at renderWithHooks (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:11596:26)
        at mountIndeterminateComponent (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:14974:21)
        at beginWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:15962:22)
        at beginWork$1 (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19806:22)
        at performUnitOfWork (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19251:20)
        at workLoopSync (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19190:13)
        at renderRootSync (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:19169:15)
        at recoverFromConcurrentError (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=1d58f139:18786:28)

## 2026-08-11 10:11:50.275Z load
- url: http://localhost:3000/dashboard

## 2026-08-11 10:11:51.153Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 223

## 2026-08-11 10:11:51.154Z console.warn
- text: [Perf] Worker took 290.3ms (target <50ms)

## 2026-08-11 10:11:51.200Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 10:11:51.201Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 10:11:51.650Z console.warn
- text: [Perf] Low FPS detected: 30

## 2026-08-11 10:11:54.472Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" START AI TRADING"}

## 2026-08-11 10:11:54.692Z console.warn
- text: [Perf] Low FPS detected: 49

## 2026-08-11 10:11:56.122Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" STOP AI TRADING"}

## 2026-08-11 10:11:57.733Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%AI LIVE12ms99.9%$94.71ENTraderOracle AI EngineACTIVE Market ConnectedScanning Global Markets...AI Confidence86%Opportunity68%Risk LevelMediumSentimentBullishAI RecommendationSTRONG BUY — BTC/USDTarget: $71,200 · SL: $65,800 · R/R: 1:2.8HIGH CONFIDENCE START AI TRADINGFinding OpportunitiesLive Market OverviewallcryptoindexforexcommodityBTBTC/USDBitcoin+2.27%$67,191Vol: 42.1BHighAnalyzeETETH/USDEthereum+1.83%$3,512Vol: 18.3BMedAnalyzeSOSOL/USDSolana+4.15%$182.48Vol: 5.2BHighAnalyzeXRXRP/USDXRP-0.83%$0.6279Vol: 2.1BMedAnalyzeBNBNB/USDBNB+0.55%$418.05Vol: 1.4BLowAnalyzeNANASDAQNASDAQ-0.46%$19,148Vol: 8.9BLowAnalyzeS&S&P500S&P 500+0.28%$5,431Vol: 12.1BLowAnalyzeGOGOLDGold+0.38%$2,342Vol: 3.2BLowAnalyzeEUEUR/USDEuro-0.07%$1.0843Vol: 6.4BLowAnalyzeGBGBP/USDPound+0.32%$1.2632Vol: 2.8BLowAnalyzeUSUSD/JPYDollar/Yen-0.18%$156.97Vol: 4.1BMedAnalyzeBTC/USD+2.3%1m5m15m1H4H1D1W1MEMA 9EMA 21RSIMACDVWAPBBAI Analysis PanelLIVE86%AI Confidence ScoreStrong BuyBTC/USD — 4H timeframeBullish Score72.42680916142325%Bearish Score28%Buy Probability82.35419430778829%Sell Probability19%Trend Strength78%Market Volatility16%Momentum55%Liquidity85%Institutional64%Expected Move3.2% Bulls 72% Bears 28%Trade ExecutionBTC/USD · $67,245AssetBTC/USDETH/USDSOL/USDXRP/USDBNB/USDGOLDEUR/USDGBP/USDCurrent Price$67,245Spread$12.4Order TypeMarketLimitStopStop-LimitLeverage1x2x5x10x20x50x100xLot SizeRisk %Take ProfitStop LossMargin: $67.25Risk: $13.45 BUY SELLAI SignalsUpdated 6:11:50 AMAssetSignalConf.TFRiskTargetStop LossEst. ProfitStatusBTC/USDBUY87%4HLow71,20065,800+8.4%ActiveETH/USDBUY74%1DMed3,8503,320+9.6%ActiveSOL/USDSELL62%4HHigh165.00195.00+9.5%PendingGOLDBUY78%1DLow2,3902,295+2.1%ActiveEUR/USDSELL55%1HLow1.071.09+0.85%PendingGBP/USDHOLD51%4HMed1.271.26+0.62%WatchXRP/USDBUY69%1DHigh0.72000.5900+14.6%ActiveNASDAQHOLD58%1DLow19,50018,..."}

## 2026-08-11 10:12:13.603Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 10:12:13.604Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 10:12:22.965Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Watchlist"}

## 2026-08-11 10:12:22.966Z navigate
- url: http://localhost:3000/dashboard#watchlist
- via: pushState

## 2026-08-11 10:12:25.403Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade"}

## 2026-08-11 10:12:25.404Z navigate
- url: http://localhost:3000/dashboard#trading?pair=BTC%2FUSD
- via: popstate

## 2026-08-11 10:12:25.627Z console.warn
- text: [Perf] Worker took 163.3ms (target <50ms)

## 2026-08-11 10:12:25.964Z console.warn
- text: [Perf] Low FPS detected: 54

## 2026-08-11 10:12:29.605Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Analysis"}

## 2026-08-11 10:12:29.606Z navigate
- url: http://localhost:3000/dashboard#analysis
- via: pushState

## 2026-08-11 10:12:32.516Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 10:12:32.516Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 10:12:37.921Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Portfolio"}

## 2026-08-11 10:12:37.922Z navigate
- url: http://localhost:3000/dashboard#portfolio
- via: pushState

## 2026-08-11 10:12:40.599Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 10:12:40.599Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 10:12:42.056Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Watchlist"}

## 2026-08-11 10:12:42.056Z navigate
- url: http://localhost:3000/dashboard#watchlist
- via: pushState

## 2026-08-11 10:12:43.866Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"News Intelligence"}

## 2026-08-11 10:12:43.867Z navigate
- url: http://localhost:3000/dashboard#news
- via: pushState

## 2026-08-11 10:12:48.786Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Smart Money"}

## 2026-08-11 10:12:48.786Z navigate
- url: http://localhost:3000/dashboard#smartmoney
- via: pushState

## 2026-08-11 10:13:14.436Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 10:13:14.437Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 10:13:18.706Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Smart Money"}

## 2026-08-11 10:13:18.707Z navigate
- url: http://localhost:3000/dashboard#smartmoney
- via: pushState

## 2026-08-11 10:13:22.368Z click
- element: {"tag":"button","role":null,"ariaLabel":"Open AI Assistant","name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":""}

## 2026-08-11 10:13:22.380Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"","valueLength":0,"text":""}

## 2026-08-11 10:13:23.655Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analyze current market conditions"}

## 2026-08-11 10:13:23.690Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/integrated-ai/stream
- status: 500
- statusText: Internal Server Error
- requestBody: {"message":"[{\"text\":\"Please respond in English. [USER TRADING CONTEXT]\\nBalance: $94.71\\nBot Status: INACTIVE\\nTotal Trades: 0\\nWin Rate: 0%\\nTotal P&L: $0.00\\nRecent Trades (last 5): None\\n[STRATEGY PARAMETERS]\\nDefault Risk Per Trade: 1%-2% of equity\\nDefault Risk/Reward: 1:2 minimum\\nExecution Mode: Bot is inactive\\nRecent Bias: N/A on N/A\\nAverage Trade P&L: $0.00\\n[/STRATEGY PARAMETERS]\\n\\n[INDICATOR SNAPSHOT]\\nWin Rate: 0%\\nTotal P&L: $0.00\\nRecent Momentum: Positive\\n[/INDICATOR SNAPSHOT]\\n[/USER TRADING CONTEXT]\\n\\nAnalyze current market conditions\",\"type\":\"text\"}]"}
- response: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}
- durationMs: 33

## 2026-08-11 10:13:23.691Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/integrated-ai/stream: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}

## 2026-08-11 10:13:25.745Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/integrated-ai/stream
- status: 500
- statusText: Internal Server Error
- requestBody: {"message":"[{\"text\":\"Please respond in English. [USER TRADING CONTEXT]\\nBalance: $94.71\\nBot Status: INACTIVE\\nTotal Trades: 0\\nWin Rate: 0%\\nTotal P&L: $0.00\\nRecent Trades (last 5): None\\n[STRATEGY PARAMETERS]\\nDefault Risk Per Trade: 1%-2% of equity\\nDefault Risk/Reward: 1:2 minimum\\nExecution Mode: Bot is inactive\\nRecent Bias: N/A on N/A\\nAverage Trade P&L: $0.00\\n[/STRATEGY PARAMETERS]\\n\\n[INDICATOR SNAPSHOT]\\nWin Rate: 0%\\nTotal P&L: $0.00\\nRecent Momentum: Positive\\n[/INDICATOR SNAPSHOT]\\n[/USER TRADING CONTEXT]\\n\\nAnalyze current market conditions\",\"type\":\"text\"}]"}
- response: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}
- durationMs: 50

## 2026-08-11 10:13:25.745Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/integrated-ai/stream: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}

## 2026-08-11 10:13:29.761Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/integrated-ai/stream
- status: 500
- statusText: Internal Server Error
- requestBody: {"message":"[{\"text\":\"Please respond in English. [USER TRADING CONTEXT]\\nBalance: $94.71\\nBot Status: INACTIVE\\nTotal Trades: 0\\nWin Rate: 0%\\nTotal P&L: $0.00\\nRecent Trades (last 5): None\\n[STRATEGY PARAMETERS]\\nDefault Risk Per Trade: 1%-2% of equity\\nDefault Risk/Reward: 1:2 minimum\\nExecution Mode: Bot is inactive\\nRecent Bias: N/A on N/A\\nAverage Trade P&L: $0.00\\n[/STRATEGY PARAMETERS]\\n\\n[INDICATOR SNAPSHOT]\\nWin Rate: 0%\\nTotal P&L: $0.00\\nRecent Momentum: Positive\\n[/INDICATOR SNAPSHOT]\\n[/USER TRADING CONTEXT]\\n\\nAnalyze current market conditions\",\"type\":\"text\"}]"}
- response: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}
- durationMs: 15

## 2026-08-11 10:13:29.762Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/integrated-ai/stream: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}

## 2026-08-11 10:13:36.557Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%AI LIVE12ms99.9%$94.71ENTraderSmart MoneyTrack institutional and whale wallet movements🏦Institutional flow tracking coming soonOn-chain whale analytics and dark pool data will appear here"}

## 2026-08-11 10:13:42.921Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%AI LIVE12ms99.9%$94.71ENTraderSmart MoneyTrack institutional and whale wallet movements🏦Institutional flow tracking coming soonOn-chain whale analytics and dark pool data will appear here"}

## 2026-08-11 10:13:44.363Z click
- element: {"tag":"button","role":null,"ariaLabel":"Close AI Assistant","name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":""}

## 2026-08-11 10:13:46.343Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 10:13:46.343Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 10:13:48.255Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 10:13:48.255Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 10:13:49.421Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 10:13:49.421Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: replaceState

## 2026-08-11 10:13:50.370Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 10:13:50.370Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-11 10:13:52.839Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Deposits"}

## 2026-08-11 10:13:52.839Z navigate
- url: http://localhost:3000/dashboard#deposits
- via: pushState

## 2026-08-11 10:13:56.645Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Withdrawals"}

## 2026-08-11 10:13:56.645Z navigate
- url: http://localhost:3000/dashboard#withdrawals
- via: pushState

## 2026-08-11 10:13:58.022Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Referral"}

## 2026-08-11 10:13:58.022Z navigate
- url: http://localhost:3000/dashboard#referral
- via: pushState

## 2026-08-11 10:13:59.259Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Referral"}

## 2026-08-11 10:13:59.260Z navigate
- url: http://localhost:3000/dashboard#referral
- via: replaceState

## 2026-08-11 10:14:01.539Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Support"}

## 2026-08-11 10:14:01.539Z navigate
- url: http://localhost:3000/dashboard#support
- via: pushState

## 2026-08-11 10:14:12.655Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Markets"}

## 2026-08-11 10:14:12.655Z navigate
- url: http://localhost:3000/dashboard#markets
- via: pushState

## 2026-08-11 10:14:23.697Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Signals"}

## 2026-08-11 10:14:23.697Z navigate
- url: http://localhost:3000/dashboard#signals
- via: pushState

## 2026-08-11 10:14:31.064Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 10:14:31.064Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 10:14:37.506Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 10:14:37.507Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 10:14:43.141Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Markets"}

## 2026-08-11 10:14:43.141Z navigate
- url: http://localhost:3000/dashboard#markets
- via: pushState

## 2026-08-11 10:14:48.740Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Signals"}

## 2026-08-11 10:14:48.740Z navigate
- url: http://localhost:3000/dashboard#signals
- via: pushState

## 2026-08-11 10:14:50.846Z click
- element: {"tag":"button","role":null,"ariaLabel":"Open AI Assistant","name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":""}

## 2026-08-11 10:14:50.855Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"","valueLength":0,"text":""}

## 2026-08-11 10:14:53.257Z click
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"","valueLength":0,"text":""}

## 2026-08-11 10:14:59.760Z change
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"hello","valueLength":5,"text":""}

## 2026-08-11 10:14:59.760Z blur
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"hello","valueLength":5,"text":""}

## 2026-08-11 10:14:59.772Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/integrated-ai/stream
- status: 500
- statusText: Internal Server Error
- requestBody: {"message":"[{\"text\":\"Please respond in English. hello\",\"type\":\"text\"}]"}
- response: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}
- durationMs: 14

## 2026-08-11 10:14:59.772Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/integrated-ai/stream: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}

## 2026-08-11 10:15:01.785Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/integrated-ai/stream
- status: 500
- statusText: Internal Server Error
- requestBody: {"message":"[{\"text\":\"Please respond in English. hello\",\"type\":\"text\"}]"}
- response: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}
- durationMs: 12

## 2026-08-11 10:15:01.785Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/integrated-ai/stream: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}

## 2026-08-11 10:15:05.799Z network.error
- method: POST
- url: http://localhost:3000/hcgi/api/integrated-ai/stream
- status: 500
- statusText: Internal Server Error
- requestBody: {"message":"[{\"text\":\"Please respond in English. hello\",\"type\":\"text\"}]"}
- response: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}
- durationMs: 13

## 2026-08-11 10:15:05.800Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/integrated-ai/stream: {"message":"Something went wrong!","error":{"name":"TypeError","message":"Failed to parse URL from undefined/generate","stack":"TypeError: Failed to parse URL from undefined/generate"}}

## 2026-08-11 10:17:32.697Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Execute Trade"}

## 2026-08-11 10:17:36.181Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Dashboard"}

## 2026-08-11 10:17:36.182Z navigate
- url: http://localhost:3000/dashboard
- via: pushState

## 2026-08-11 10:17:36.404Z console.warn
- text: [Perf] Worker took 165.7ms (target <50ms)

## 2026-08-11 10:17:36.417Z console.warn
- text: [Perf] Low FPS detected: 54

## 2026-08-11 10:17:45.134Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 10:17:45.134Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 10:18:43.019Z click
- element: {"tag":"button","role":null,"ariaLabel":"Close AI Assistant","name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":""}

## 2026-08-11 10:18:44.951Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"EN"}

## 2026-08-11 10:18:46.470Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"EN"}

## 2026-08-11 10:18:46.952Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"EN"}

## 2026-08-11 10:18:47.754Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%AI LIVE12ms99.9%$94.71ENTraderOrdersView all open, filled, and canceled ordersSymbolSideQuantityPriceStatusTimeBTC/USDBUY0.5$66,800FILLED14:32:10ETH/USDSELL5$3,480OPEN14:28:05XAU/USDBUY1$2,310CANCELED13:55:22"}

## 2026-08-11 10:18:48.585Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"EN"}

## 2026-08-11 10:18:49.372Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%AI LIVE12ms99.9%$94.71ENTraderOrdersView all open, filled, and canceled ordersSymbolSideQuantityPriceStatusTimeBTC/USDBUY0.5$66,800FILLED14:32:10ETH/USDSELL5$3,480OPEN14:28:05XAU/USDBUY1$2,310CANCELED13:55:22"}

## 2026-08-11 10:18:50.672Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 10:18:50.673Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 10:19:01.646Z click
- element: {"tag":"p","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"No open positions — place a trade above to get started"}

## 2026-08-11 10:19:03.069Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Watchlist"}

## 2026-08-11 10:19:03.070Z navigate
- url: http://localhost:3000/dashboard#watchlist
- via: pushState

## 2026-08-11 10:19:08.536Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 10:19:08.537Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 10:19:36.389Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 10:19:36.390Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-11 10:20:14.811Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Signals"}

## 2026-08-11 10:20:14.812Z navigate
- url: http://localhost:3000/dashboard#signals
- via: pushState

## 2026-08-11 10:20:14.894Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Signals"}

## 2026-08-11 10:20:14.894Z navigate
- url: http://localhost:3000/dashboard#signals
- via: replaceState

## 2026-08-11 10:20:26.067Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Analysis"}

## 2026-08-11 10:20:26.068Z navigate
- url: http://localhost:3000/dashboard#analysis
- via: pushState

## 2026-08-11 10:20:35.236Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 10:20:35.237Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 10:20:56.865Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 15

## 2026-08-11 10:20:56.865Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 10:21:00.385Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 10:21:00.386Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:21:00.387Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 1/8 in 1000ms

## 2026-08-11 10:21:01.392Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 6

## 2026-08-11 10:21:01.392Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:21:01.392Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 2/8 in 2000ms

## 2026-08-11 10:21:03.394Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 10:21:03.394Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:21:03.394Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 3/8 in 4000ms

## 2026-08-11 10:21:07.396Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 10:21:07.396Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:21:07.396Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 4/8 in 8000ms

## 2026-08-11 10:21:15.399Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 10:21:15.399Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:21:15.399Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 5/8 in 16000ms

## 2026-08-11 10:22:29.738Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":"trading-side-sell","placeholder":null,"label":null,"value":null,"valueLength":0,"text":"SELL"}

## 2026-08-11 10:22:31.316Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":"trading-side-buy","placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BUY"}

## 2026-08-11 10:22:32.368Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":"trading-side-sell","placeholder":null,"label":null,"value":null,"valueLength":0,"text":"SELL"}

## 2026-08-11 10:22:33.625Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":"trading-side-buy","placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BUY"}

## 2026-08-11 10:22:37.080Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 10:22:37.081Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 10:23:18.944Z console.warn
- text: [Perf] Low FPS detected: 1

## 2026-08-11 10:23:22.167Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Dashboard"}

## 2026-08-11 10:23:22.168Z navigate
- url: http://localhost:3000/dashboard
- via: pushState

## 2026-08-11 10:23:22.400Z console.warn
- text: [Perf] Worker took 175.9ms (target <50ms)

## 2026-08-11 10:23:23.134Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" START AI TRADING"}

## 2026-08-11 10:23:29.116Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" STOP AI TRADING"}

## 2026-08-11 10:23:34.511Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"1D"}

## 2026-08-11 10:23:35.652Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"1D"}

## 2026-08-11 10:23:52.255Z click
- element: {"tag":"span","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"+3.97%"}

## 2026-08-11 10:23:53.503Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"ETH+1.85%"}

## 2026-08-11 10:23:55.100Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BTC+2.78%"}

## 2026-08-11 10:23:56.786Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"XRP-0.64%"}

## 2026-08-11 10:24:14.219Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Watchlist"}

## 2026-08-11 10:24:14.220Z navigate
- url: http://localhost:3000/dashboard#watchlist
- via: pushState

## 2026-08-11 10:24:15.706Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 10:24:15.707Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 10:24:17.688Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"News Intelligence"}

## 2026-08-11 10:24:17.688Z navigate
- url: http://localhost:3000/dashboard#news
- via: pushState

## 2026-08-11 10:24:19.817Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Smart Money"}

## 2026-08-11 10:24:19.817Z navigate
- url: http://localhost:3000/dashboard#smartmoney
- via: pushState

## 2026-08-11 10:24:24.697Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"🏦Institutional flow tracking coming soonOn-chain whale analytics and dark pool data will appear here"}

## 2026-08-11 10:28:57.060Z load
- url: http://localhost:3000/dashboard#smartmoney

## 2026-08-11 10:28:57.632Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 91

## 2026-08-11 10:28:57.633Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 10:28:57.634Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 10:29:02.113Z click
- element: {"tag":"h1","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Smart Money"}

## 2026-08-11 10:30:50.776Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Markets"}

## 2026-08-11 10:30:50.780Z navigate
- url: http://localhost:3000/dashboard#markets
- via: pushState

## 2026-08-11 10:30:53.940Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Analysis"}

## 2026-08-11 10:30:53.941Z navigate
- url: http://localhost:3000/dashboard#analysis
- via: pushState

## 2026-08-11 10:30:55.490Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 10:30:55.490Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 10:31:10.356Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Dashboard"}

## 2026-08-11 10:31:10.357Z navigate
- url: http://localhost:3000/dashboard
- via: pushState

## 2026-08-11 10:31:10.624Z console.warn
- text: [Perf] Worker took 186.9ms (target <50ms)

## 2026-08-11 10:31:11.256Z console.warn
- text: [Perf] Low FPS detected: 53

## 2026-08-11 10:31:38.645Z load
- url: http://localhost:3000/dashboard

## 2026-08-11 10:31:43.567Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 2196

## 2026-08-11 10:31:43.571Z console.warn
- text: [Perf] Worker took 2902.4ms (target <50ms)

## 2026-08-11 10:31:44.015Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 10:31:44.016Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 10:32:21.713Z console.warn
- text: [Perf] Worker took 194.4ms (target <50ms)

## 2026-08-11 10:33:32.672Z console.warn
- text: [Perf] Worker took 55.1ms (target <50ms)

## 2026-08-11 10:34:34.661Z console.warn
- text: [Perf] Worker took 248.7ms (target <50ms)

## 2026-08-11 10:35:13.780Z load
- url: http://localhost:3000/dashboard

## 2026-08-11 10:35:16.566Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 898

## 2026-08-11 10:35:16.719Z console.warn
- text: [Perf] Worker took 1392.5ms (target <50ms)

## 2026-08-11 10:35:16.720Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 10:35:16.720Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 10:35:44.504Z console.warn
- text: [Perf] Low FPS detected: 52

## 2026-08-11 10:35:46.118Z load
- url: http://localhost:3000/dashboard

## 2026-08-11 10:35:46.789Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 237

## 2026-08-11 10:35:46.837Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 10:35:46.838Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 10:35:46.838Z console.warn
- text: [Perf] Worker took 287.0ms (target <50ms)

## 2026-08-11 10:35:47.456Z console.warn
- text: [Perf] Low FPS detected: 44

## 2026-08-11 10:35:47.784Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" START AI TRADING"}

## 2026-08-11 10:35:48.470Z console.warn
- text: [Perf] Low FPS detected: 53

## 2026-08-11 10:35:49.860Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":" STOP AI TRADING"}

## 2026-08-11 10:35:51.100Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%BTC67,245+2.3%ETH3,512+1.8%SOL182.4+4.1%XRP0.628-0.9%GOLD2,341+0.4%EUR/USD1.0842-0.1%AI LIVE12ms99.9%$94.71ENTraderOracle AI EngineACTIVE Market ConnectedScanning Global Markets...AI Confidence87%Opportunity72%Risk LevelMediumSentimentBullishAI RecommendationSTRONG BUY — BTC/USDTarget: $71,200 · SL: $65,800 · R/R: 1:2.8HIGH CONFIDENCE START AI TRADINGAnalyzing PatternsLive Market OverviewallcryptoindexforexcommodityBTBTC/USDBitcoin+2.34%$67,293Vol: 42.1BHighAnalyzeETETH/USDEthereum+1.79%$3,514Vol: 18.3BMedAnalyzeSOSOL/USDSolana+4.11%$182.33Vol: 5.2BHighAnalyzeXRXRP/USDXRP-0.88%$0.6282Vol: 2.1BMedAnalyzeBNBNB/USDBNB+0.58%$418.28Vol: 1.4BLowAnalyzeNANASDAQNASDAQ-0.43%$19,117Vol: 8.9BLowAnalyzeS&S&P500S&P 500+0.16%$5,433Vol: 12.1BLowAnalyzeGOGOLDGold+0.42%$2,343Vol: 3.2BLowAnalyzeEUEUR/USDEuro-0.14%$1.0838Vol: 6.4BLowAnalyzeGBGBP/USDPound+0.26%$1.2636Vol: 2.8BLowAnalyzeUSUSD/JPYDollar/Yen-0.22%$156.84Vol: 4.1BMedAnalyzeBTC/USD+2.3%1m5m15m1H4H1D1W1MEMA 9EMA 21RSIMACDVWAPBBAI Analysis PanelLIVE88%AI Confidence ScoreStrong BuyBTC/USD — 4H timeframeBullish Score72.16046218972261%Bearish Score28%Buy Probability81.03219639233333%Sell Probability19%Trend Strength78%Market Volatility17%Momentum64.00173538167672%Liquidity85%Institutional64%Expected Move3.2% Bulls 72% Bears 28%Trade ExecutionBTC/USD · $67,245AssetBTC/USDETH/USDSOL/USDXRP/USDBNB/USDGOLDEUR/USDGBP/USDCurrent Price$67,245Spread$12.4Order TypeMarketLimitStopStop-LimitLeverage1x2x5x10x20x50x100xLot SizeRisk %Take ProfitStop LossMargin: $67.25Risk: $13.45 BUY SELLAI SignalsUpdated 6:35:46 AMAssetSignalConf.TFRiskTargetStop LossEst. ProfitStatusBTC/USDBUY87%4HLow71,20065,800+8.4%ActiveETH/USDBUY74%1DMed3,8503,320+9.6%ActiveSOL/USDSELL62%4HHigh165.00195.00+9.5%PendingGOLDBUY78%1DLow2,3902,295+2.1%ActiveEUR/USDSELL55%1HLow1.071.09+0.85%PendingGBP/USDHOLD51%4HMed1.271.26+0.62%WatchXRP/USDBUY69%1DHigh0.72000.5900+14.6%ActiveNASDAQHOLD58%1D..."}

## 2026-08-11 10:36:12.714Z console.warn
- text: [Perf] Worker took 199.1ms (target <50ms)

## 2026-08-11 10:36:18.570Z console.warn
- text: [Perf] Worker took 91.1ms (target <50ms)

## 2026-08-11 10:36:28.195Z click
- element: {"tag":"button","role":null,"ariaLabel":"Open AI Assistant","name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":""}

## 2026-08-11 10:36:28.237Z focus
- element: {"tag":"input","role":null,"ariaLabel":null,"name":"message","type":"text","id":"ai-chat-input","placeholder":"Ask a question...","label":"message","value":"","valueLength":0,"text":""}

## 2026-08-11 10:36:29.588Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analyze current market conditions"}

## 2026-08-11 10:37:02.634Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Oracle AI EngineACTIVE Market ConnectedScanning Global Markets...AI Confidence91%Opportunity57%Risk LevelMediumSentimentBullishAI RecommendationSTRONG BUY — BTC/USDTarget: $71,200 · SL: $65,800 · R/R: 1:2.8HIGH CONFIDENCE START AI TRADING"}

## 2026-08-11 10:37:04.896Z console.warn
- text: [Perf] Low FPS detected: 28

## 2026-08-11 10:37:05.913Z console.warn
- text: [Perf] Low FPS detected: 50

## 2026-08-11 10:37:54.827Z console.warn
- text: [Perf] Worker took 201.5ms (target <50ms)

## 2026-08-11 10:38:06.575Z console.warn
- text: [Perf] Worker took 56.7ms (target <50ms)

## 2026-08-11 10:43:56.187Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 10

## 2026-08-11 10:43:56.188Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 10:43:56.191Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 15

## 2026-08-11 10:43:56.192Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:43:56.227Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 1/8 in 1000ms

## 2026-08-11 10:44:06.885Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 10:44:06.885Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:44:06.885Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 2/8 in 2000ms

## 2026-08-11 10:44:14.733Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 7

## 2026-08-11 10:44:14.733Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:44:14.734Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 3/8 in 4000ms

## 2026-08-11 10:46:36.642Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 10:46:36.642Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:46:36.643Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 1/8 in 1000ms

## 2026-08-11 10:46:38.532Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 10:46:38.532Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:46:38.533Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 2/8 in 2000ms

## 2026-08-11 10:46:42.033Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 10:46:42.033Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:46:42.033Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 3/8 in 4000ms

## 2026-08-11 10:46:46.533Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 10:46:46.533Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:46:46.533Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 4/8 in 8000ms

## 2026-08-11 10:46:55.533Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 10:46:55.533Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:46:55.536Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 5/8 in 16000ms

## 2026-08-11 10:47:03.533Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 10:47:03.533Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 10:47:21.234Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 10:47:21.234Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:47:21.234Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 6/8 in 30000ms

## 2026-08-11 10:47:56.188Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 6

## 2026-08-11 10:47:56.188Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:47:56.188Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 7/8 in 30000ms

## 2026-08-11 10:48:27.789Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 52

## 2026-08-11 10:48:27.790Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:48:27.792Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 8/8 in 30000ms

## 2026-08-11 10:49:08.542Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 9

## 2026-08-11 10:49:08.542Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 10:49:08.542Z console.error
- text: [useAIConnection] Max reconnect attempts reached. Giving up.

## 2026-08-11 10:49:08.543Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 9

## 2026-08-11 10:49:08.694Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 10:50:32.443Z console.warn
- text: [Perf] Worker took 54.0ms (target <50ms)

## 2026-08-11 10:51:34.297Z console.warn
- text: [Perf] Worker took 644.8ms (target <50ms)

## 2026-08-11 10:53:09.593Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 49

## 2026-08-11 10:53:09.594Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 10:54:52.495Z console.warn
- text: [Perf] Low FPS detected: 49

## 2026-08-11 10:55:01.763Z console.warn
- text: [Perf] Worker took 75.4ms (target <50ms)

## 2026-08-11 10:55:02.405Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Watchlist"}

## 2026-08-11 10:55:02.412Z navigate
- url: http://localhost:3000/dashboard#watchlist
- via: pushState

## 2026-08-11 10:55:02.561Z console.warn
- text: [Perf] Low FPS detected: 47

## 2026-08-11 10:55:03.739Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Portfolio"}

## 2026-08-11 10:55:03.739Z navigate
- url: http://localhost:3000/dashboard#portfolio
- via: pushState

## 2026-08-11 10:55:28.248Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Performance"}

## 2026-08-11 10:55:29.644Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Transactions"}

## 2026-08-11 10:55:31.128Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Frais"}

## 2026-08-11 10:55:32.529Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Transactions"}

## 2026-08-11 10:55:33.153Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Performance"}

## 2026-08-11 10:55:33.861Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Aperçu"}

## 2026-08-11 10:55:37.745Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Masquer les petits soldes"}

## 2026-08-11 10:55:38.344Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Masquer les petits soldes"}

## 2026-08-11 10:55:38.948Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Masquer les petits soldes"}

## 2026-08-11 10:58:44.014Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Performance"}

## 2026-08-11 10:58:45.038Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Transactions"}

## 2026-08-11 10:58:59.959Z console.warn
- text: [Perf] Low FPS detected: 5

## 2026-08-11 10:59:41.251Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 50

## 2026-08-11 10:59:41.251Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:00:04.711Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 10

## 2026-08-11 11:00:04.711Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:00:17.156Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:00:17.156Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:00:34.309Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 7

## 2026-08-11 11:00:34.309Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:01:03.788Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:01:03.788Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:01:34.561Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 7

## 2026-08-11 11:01:34.561Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:02:04.560Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 6

## 2026-08-11 11:02:04.560Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:02:20.210Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 11:02:20.211Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:05:42.053Z load
- url: http://localhost:3000/dashboard#portfolio

## 2026-08-11 11:05:43.000Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 267

## 2026-08-11 11:05:43.033Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:05:43.035Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:05:43.585Z console.warn
- text: [Perf] Low FPS detected: 45

## 2026-08-11 11:05:45.881Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Performance"}

## 2026-08-11 11:05:47.625Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Transactions"}

## 2026-08-11 11:05:48.780Z click
- element: {"tag":"button","role":null,"ariaLabel":null,"name":null,"type":"button","id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Frais"}

## 2026-08-11 11:05:51.014Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 11:05:51.015Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 11:06:09.570Z console.warn
- text: [Perf] Low FPS detected: 1

## 2026-08-11 11:08:10.361Z console.warn
- text: [Perf] Low FPS detected: 1

## 2026-08-11 11:08:12.990Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:08:13.541Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC%2FUSD
- status: 500
- statusText: Internal Server Error
- durationMs: 43

## 2026-08-11 11:08:13.542Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC%2FUSD&interval=300&limit=48
- status: 500
- statusText: Internal Server Error
- durationMs: 44

## 2026-08-11 11:08:13.542Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 43

## 2026-08-11 11:08:13.542Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/bot/status
- status: 500
- statusText: Internal Server Error
- durationMs: 43

## 2026-08-11 11:08:13.543Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 500
- statusText: Internal Server Error
- durationMs: 43

## 2026-08-11 11:08:13.543Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/trades
- status: 500
- statusText: Internal Server Error
- durationMs: 44

## 2026-08-11 11:08:13.543Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC%2FUSD: 

## 2026-08-11 11:08:13.544Z console.error
- text: 
    Failed to load positions: Error: HTTP 500
        at http://localhost:3000/src/views/TradingView.jsx:102:15

## 2026-08-11 11:08:13.545Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC%2FUSD&interval=300&limit=48: 

## 2026-08-11 11:08:13.546Z console.error
- text: 
    Failed to load candles: Error: HTTP 500
        at http://localhost:3000/src/views/TradingView.jsx:66:15

## 2026-08-11 11:08:13.546Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:08:13.547Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 1/8 in 1000ms

## 2026-08-11 11:08:13.547Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/bot/status: 

## 2026-08-11 11:08:13.548Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: 

## 2026-08-11 11:08:13.548Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 500
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:08:13.548Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/trades: 

## 2026-08-11 11:08:14.053Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:08:14.053Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:08:14.553Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:08:14.553Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:08:14.553Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 2/8 in 2000ms

## 2026-08-11 11:08:16.557Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 11:08:16.557Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:08:16.557Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 3/8 in 4000ms

## 2026-08-11 11:08:20.563Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:08:20.563Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:08:20.563Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 4/8 in 8000ms

## 2026-08-11 11:08:29.567Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 11:08:29.567Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:08:29.567Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 5/8 in 16000ms

## 2026-08-11 11:08:46.574Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 8

## 2026-08-11 11:08:46.574Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:08:46.574Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 6/8 in 30000ms

## 2026-08-11 11:09:23.571Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 11:09:23.571Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:09:23.571Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 11:09:23.571Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:09:23.571Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 7/8 in 30000ms

## 2026-08-11 11:09:56.275Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 6

## 2026-08-11 11:09:56.275Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:09:56.275Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 8/8 in 30000ms

## 2026-08-11 11:10:26.554Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 12

## 2026-08-11 11:10:26.592Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:10:26.592Z console.error
- text: [useAIConnection] Max reconnect attempts reached. Giving up.

## 2026-08-11 11:10:51.938Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:10:52.471Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC%2FUSD&interval=300&limit=48
- status: 500
- statusText: Internal Server Error
- durationMs: 15

## 2026-08-11 11:10:52.471Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC%2FUSD
- status: 500
- statusText: Internal Server Error
- durationMs: 15

## 2026-08-11 11:10:52.471Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC%2FUSD&interval=300&limit=48: 

## 2026-08-11 11:10:52.472Z console.error
- text: 
    Failed to load candles: Error: HTTP 500
        at http://localhost:3000/src/views/TradingView.jsx:66:15

## 2026-08-11 11:10:52.472Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC%2FUSD: 

## 2026-08-11 11:10:52.472Z console.error
- text: 
    Failed to load positions: Error: HTTP 500
        at http://localhost:3000/src/views/TradingView.jsx:102:15

## 2026-08-11 11:10:52.473Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 16

## 2026-08-11 11:10:52.485Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:10:52.485Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 1/8 in 1000ms

## 2026-08-11 11:10:52.485Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/bot/status
- status: 500
- statusText: Internal Server Error
- durationMs: 28

## 2026-08-11 11:10:52.499Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/bot/status: 

## 2026-08-11 11:10:52.499Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/trades
- status: 500
- statusText: Internal Server Error
- durationMs: 42

## 2026-08-11 11:10:52.502Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 500
- statusText: Internal Server Error
- durationMs: 44

## 2026-08-11 11:10:52.502Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/trades: 

## 2026-08-11 11:10:52.502Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: 

## 2026-08-11 11:10:52.503Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 500
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:10:53.007Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 11:10:53.007Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:10:53.504Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 18

## 2026-08-11 11:10:53.504Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:10:53.505Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 2/8 in 2000ms

## 2026-08-11 11:10:55.510Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 11:10:55.510Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:10:55.511Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 3/8 in 4000ms

## 2026-08-11 11:10:59.518Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 6

## 2026-08-11 11:10:59.518Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:10:59.518Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 4/8 in 8000ms

## 2026-08-11 11:11:07.523Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:11:07.523Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:11:07.523Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 5/8 in 16000ms

## 2026-08-11 11:11:23.529Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:11:23.529Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:11:23.529Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 6/8 in 30000ms

## 2026-08-11 11:11:52.463Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:11:52.463Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:11:53.535Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:11:53.535Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:11:53.535Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 7/8 in 30000ms

## 2026-08-11 11:12:23.541Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:12:23.541Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:12:23.542Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 8/8 in 30000ms

## 2026-08-11 11:12:53.546Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 11:12:53.546Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:12:53.546Z console.error
- text: [useAIConnection] Max reconnect attempts reached. Giving up.

## 2026-08-11 11:12:59.019Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"📊Live Candlestick ChartFull chart available on dashboard"}

## 2026-08-11 11:13:01.085Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Dashboard"}

## 2026-08-11 11:13:01.087Z navigate
- url: http://localhost:3000/dashboard
- via: pushState

## 2026-08-11 11:13:01.437Z console.warn
- text: [Perf] Low FPS detected: 49

## 2026-08-11 11:13:01.470Z console.warn
- text: [Perf] Worker took 257.0ms (target <50ms)

## 2026-08-11 11:13:02.741Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Markets"}

## 2026-08-11 11:13:02.742Z navigate
- url: http://localhost:3000/dashboard#markets
- via: pushState

## 2026-08-11 11:13:04.828Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Signals"}

## 2026-08-11 11:13:04.828Z navigate
- url: http://localhost:3000/dashboard#signals
- via: pushState

## 2026-08-11 11:13:06.370Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Analysis"}

## 2026-08-11 11:13:06.370Z navigate
- url: http://localhost:3000/dashboard#analysis
- via: pushState

## 2026-08-11 11:13:07.871Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 11:13:07.871Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 11:13:07.905Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC%2FUSD&interval=300&limit=48
- status: 500
- statusText: Internal Server Error
- durationMs: 15

## 2026-08-11 11:13:07.906Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC%2FUSD
- status: 500
- statusText: Internal Server Error
- durationMs: 15

## 2026-08-11 11:13:07.906Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC%2FUSD&interval=300&limit=48: 

## 2026-08-11 11:13:07.906Z console.error
- text: 
    Failed to load candles: Error: HTTP 500
        at http://localhost:3000/src/views/TradingView.jsx:66:15

## 2026-08-11 11:13:07.906Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC%2FUSD: 

## 2026-08-11 11:13:07.906Z console.error
- text: 
    Failed to load positions: Error: HTTP 500
        at http://localhost:3000/src/views/TradingView.jsx:102:15

## 2026-08-11 11:13:16.802Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Portfolio"}

## 2026-08-11 11:13:16.803Z navigate
- url: http://localhost:3000/dashboard#portfolio
- via: pushState

## 2026-08-11 11:13:16.843Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 6

## 2026-08-11 11:13:16.843Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:13:31.814Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 11:13:31.814Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 11:13:32.027Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/coinbase/fills?limit=60
- status: 500
- statusText: Internal Server Error
- durationMs: 193

## 2026-08-11 11:13:32.027Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/coinbase/fills?limit=60: 

## 2026-08-11 11:13:36.839Z load
- url: http://localhost:3000/dashboard#orders

## 2026-08-11 11:13:37.478Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/coinbase/fills?limit=60
- status: 500
- statusText: Internal Server Error
- durationMs: 77

## 2026-08-11 11:13:37.486Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 82

## 2026-08-11 11:13:37.486Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/bot/status
- status: 500
- statusText: Internal Server Error
- durationMs: 82

## 2026-08-11 11:13:37.487Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/trades
- status: 500
- statusText: Internal Server Error
- durationMs: 82

## 2026-08-11 11:13:37.487Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 500
- statusText: Internal Server Error
- durationMs: 81

## 2026-08-11 11:13:37.506Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/coinbase/fills?limit=60: 

## 2026-08-11 11:13:37.509Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:13:37.510Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 1/8 in 1000ms

## 2026-08-11 11:13:37.515Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/bot/status: 

## 2026-08-11 11:13:37.518Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/trades: 

## 2026-08-11 11:13:37.520Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: 

## 2026-08-11 11:13:37.522Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 500
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:13:38.028Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 8

## 2026-08-11 11:13:38.028Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:13:38.299Z console.warn
- text: [Perf] Low FPS detected: 51

## 2026-08-11 11:13:38.514Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 11:13:38.514Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:13:38.514Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 2/8 in 2000ms

## 2026-08-11 11:13:40.523Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 7

## 2026-08-11 11:13:40.523Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:13:40.524Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 3/8 in 4000ms

## 2026-08-11 11:13:44.528Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 11:13:44.528Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:13:44.528Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 4/8 in 8000ms

## 2026-08-11 11:13:52.535Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 11:13:52.535Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:13:52.535Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 5/8 in 16000ms

## 2026-08-11 11:14:07.427Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/coinbase/fills?limit=60
- status: 500
- statusText: Internal Server Error
- durationMs: 23

## 2026-08-11 11:14:07.427Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/coinbase/fills?limit=60: 

## 2026-08-11 11:14:08.543Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 7

## 2026-08-11 11:14:08.543Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:14:08.543Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 6/8 in 30000ms

## 2026-08-11 11:14:37.409Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/coinbase/fills?limit=60
- status: 500
- statusText: Internal Server Error
- durationMs: 6

## 2026-08-11 11:14:37.409Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/coinbase/fills?limit=60: 

## 2026-08-11 11:14:37.412Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 11:14:37.412Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:14:38.548Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 11:14:38.548Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:14:38.548Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 7/8 in 30000ms

## 2026-08-11 11:14:49.243Z console.warn
- text: [Perf] Low FPS detected: 1

## 2026-08-11 11:14:59.963Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Simulated fills"}

## 2026-08-11 11:15:00.497Z click
- element: {"tag":"div","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Simulated fills"}

## 2026-08-11 11:15:05.143Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Markets"}

## 2026-08-11 11:15:05.144Z navigate
- url: http://localhost:3000/dashboard#markets
- via: pushState

## 2026-08-11 11:15:06.769Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Signals"}

## 2026-08-11 11:15:06.769Z navigate
- url: http://localhost:3000/dashboard#signals
- via: pushState

## 2026-08-11 11:15:07.567Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Analysis"}

## 2026-08-11 11:15:07.567Z navigate
- url: http://localhost:3000/dashboard#analysis
- via: pushState

## 2026-08-11 11:15:08.554Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 3

## 2026-08-11 11:15:08.554Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:15:08.554Z console.warn
- text: [useAIConnection] Backend unreachable (500). Retry 8/8 in 30000ms

## 2026-08-11 11:15:08.694Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 11:15:08.694Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 11:15:08.719Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC-USD&interval=900&limit=160
- status: 500
- statusText: Internal Server Error
- durationMs: 4

## 2026-08-11 11:15:08.719Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/candles?symbol=BTC-USD&interval=900&limit=160: 

## 2026-08-11 11:15:08.720Z console.error
- text: 
    Failed to load candles: Error: HTTP 500
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:231:15

## 2026-08-11 11:15:08.721Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC-USD
- status: 500
- statusText: Internal Server Error
- durationMs: 6

## 2026-08-11 11:15:08.733Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/oracle-trader-pro/positions?symbol=BTC-USD: 

## 2026-08-11 11:15:08.733Z console.error
- text: 
    Failed to load positions: Error: HTTP 500
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:265:15

## 2026-08-11 11:15:10.961Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Portfolio"}

## 2026-08-11 11:15:10.962Z navigate
- url: http://localhost:3000/dashboard#portfolio
- via: pushState

## 2026-08-11 11:15:11.000Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 11:15:11.000Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:15:12.415Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 11:15:12.415Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 11:15:12.450Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/coinbase/fills?limit=60
- status: 500
- statusText: Internal Server Error
- durationMs: 16

## 2026-08-11 11:15:12.450Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/coinbase/fills?limit=60: 

## 2026-08-11 11:15:13.647Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Watchlist"}

## 2026-08-11 11:15:13.650Z navigate
- url: http://localhost:3000/dashboard#watchlist
- via: pushState

## 2026-08-11 11:15:15.394Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"News Intelligence"}

## 2026-08-11 11:15:15.394Z navigate
- url: http://localhost:3000/dashboard#news
- via: pushState

## 2026-08-11 11:15:17.333Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Smart Money"}

## 2026-08-11 11:15:17.333Z navigate
- url: http://localhost:3000/dashboard#smartmoney
- via: pushState

## 2026-08-11 11:15:23.546Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 11:15:23.546Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 11:15:39.894Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/health
- status: 500
- statusText: Internal Server Error
- durationMs: 36

## 2026-08-11 11:15:39.894Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/health: 

## 2026-08-11 11:15:39.894Z console.error
- text: [useAIConnection] Max reconnect attempts reached. Giving up.

## 2026-08-11 11:15:58.809Z console.warn
- text: [Perf] Low FPS detected: 2

## 2026-08-11 11:18:37.599Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/user/balance
- status: 500
- statusText: Internal Server Error
- durationMs: 49

## 2026-08-11 11:18:37.599Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/user/balance: 

## 2026-08-11 11:20:35.556Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/economic-calendar?range=week&impact=all&currency=all
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 11:20:35.556Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/economic-calendar?range=week&impact=all&currency=all: 

## 2026-08-11 11:20:35.556Z console.error
- text: 
    Failed to load economic calendar: SyntaxError: Unexpected end of JSON input
        at load (http://localhost:3000/src/views/EconomicCalendarView.jsx?t=1786447224830:161:40)

## 2026-08-11 11:20:52.379Z focus
- element: {"tag":"select","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":"Date","value":"week","valueLength":4,"text":"TodayThis WeekUpcoming"}

## 2026-08-11 11:20:52.394Z click
- element: {"tag":"select","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":"Date","value":"week","valueLength":4,"text":"TodayThis WeekUpcoming"}

## 2026-08-11 11:20:54.251Z change
- element: {"tag":"select","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":"Date","value":"today","valueLength":5,"text":"TodayThis WeekUpcoming"}

## 2026-08-11 11:20:54.255Z click
- element: {"tag":"select","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":"Date","value":"today","valueLength":5,"text":"TodayThis WeekUpcoming"}

## 2026-08-11 11:20:54.260Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/economic-calendar?range=today&impact=all&currency=all
- status: 500
- statusText: Internal Server Error
- durationMs: 6

## 2026-08-11 11:20:54.260Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/economic-calendar?range=today&impact=all&currency=all: 

## 2026-08-11 11:20:54.260Z console.error
- text: 
    Failed to load economic calendar: SyntaxError: Unexpected end of JSON input
        at load (http://localhost:3000/src/views/EconomicCalendarView.jsx?t=1786447224830:161:40)

## 2026-08-11 11:21:00.668Z blur
- element: {"tag":"select","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":"Date","value":"today","valueLength":5,"text":"TodayThis WeekUpcoming"}

## 2026-08-11 11:21:00.669Z focus
- element: {"tag":"select","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":"Currency / Region","value":"all","valueLength":3,"text":"All RegionsUSDEURGBPGlobal"}

## 2026-08-11 11:21:00.677Z click
- element: {"tag":"select","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":"Currency / Region","value":"all","valueLength":3,"text":"All RegionsUSDEURGBPGlobal"}

## 2026-08-11 11:21:03.898Z blur
- element: {"tag":"select","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":"Currency / Region","value":"all","valueLength":3,"text":"All RegionsUSDEURGBPGlobal"}

## 2026-08-11 11:21:04.015Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:21:04.015Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:21:05.515Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 11:21:05.515Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 11:21:05.539Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/economic-calendar?range=week&impact=all&currency=all
- status: 500
- statusText: Internal Server Error
- durationMs: 5

## 2026-08-11 11:21:05.539Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/economic-calendar?range=week&impact=all&currency=all: 

## 2026-08-11 11:21:05.539Z console.error
- text: 
    Failed to load economic calendar: SyntaxError: Unexpected end of JSON input
        at load (http://localhost:3000/src/views/EconomicCalendarView.jsx?t=1786447224830:161:40)

## 2026-08-11 11:21:06.717Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:21:06.717Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:23:56.663Z load
- url: http://localhost:3000/dashboard#analytics

## 2026-08-11 11:23:58.115Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 207

## 2026-08-11 11:23:58.166Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:23:58.167Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:25:59.632Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 11:25:59.633Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 11:26:10.013Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:26:10.014Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:26:12.122Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 11:26:12.122Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 11:26:42.131Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:26:42.131Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:26:42.248Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:26:42.248Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: replaceState

## 2026-08-11 11:26:44.397Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 11:26:44.398Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 11:26:45.131Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Smart Money"}

## 2026-08-11 11:26:45.132Z navigate
- url: http://localhost:3000/dashboard#smartmoney
- via: pushState

## 2026-08-11 11:26:48.839Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:26:48.840Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:26:50.665Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 11:26:50.666Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-11 11:26:52.954Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:26:52.954Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:26:55.199Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 11:26:55.199Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-11 11:27:06.179Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"News Intelligence"}

## 2026-08-11 11:27:06.180Z navigate
- url: http://localhost:3000/dashboard#news
- via: pushState

## 2026-08-11 11:27:08.735Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Smart Money"}

## 2026-08-11 11:27:08.736Z navigate
- url: http://localhost:3000/dashboard#smartmoney
- via: pushState

## 2026-08-11 11:27:11.413Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 11:27:11.414Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 11:27:13.167Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:27:13.167Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:27:46.502Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 11:27:46.502Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-11 11:28:34.601Z console.warn
- text: [Perf] Low FPS detected: 1

## 2026-08-11 11:28:36.603Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:28:36.603Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:28:40.191Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Smart Money"}

## 2026-08-11 11:28:40.191Z navigate
- url: http://localhost:3000/dashboard#smartmoney
- via: pushState

## 2026-08-11 11:28:41.501Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 11:28:41.501Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 11:28:47.161Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:28:47.161Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:28:50.558Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 11:28:50.558Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-11 11:28:52.925Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Deposits"}

## 2026-08-11 11:28:52.926Z navigate
- url: http://localhost:3000/dashboard#deposits
- via: pushState

## 2026-08-11 11:28:54.369Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Withdrawals"}

## 2026-08-11 11:28:54.369Z navigate
- url: http://localhost:3000/dashboard#withdrawals
- via: pushState

## 2026-08-11 11:28:55.971Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 11:28:55.972Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-11 11:28:56.863Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:28:56.863Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:28:59.479Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Watchlist"}

## 2026-08-11 11:28:59.479Z navigate
- url: http://localhost:3000/dashboard#watchlist
- via: pushState

## 2026-08-11 11:29:00.229Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 11:29:00.229Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 11:29:00.518Z console.error
- text: 
    Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.%s 723364de-9f4a-4e1b-97f5-aa4aa1f01927-28/6/26 18:53:54-BTC-USD 
        at tbody
        at table
        at div
        at div
        at div
        at div
        at OrdersView (http://localhost:3000/src/views/OrdersView.jsx?t=1786445146835:181:27)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447224830:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App

## 2026-08-11 11:29:00.519Z console.error
- text: 
    Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.%s 723364de-9f4a-4e1b-97f5-aa4aa1f01927-28/6/26 18:53:54-BTC-USD 
        at tbody
        at table
        at div
        at div
        at div
        at div
        at OrdersView (http://localhost:3000/src/views/OrdersView.jsx?t=1786445146835:181:27)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447224830:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App

## 2026-08-11 11:29:01.409Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Portfolio"}

## 2026-08-11 11:29:01.410Z navigate
- url: http://localhost:3000/dashboard#portfolio
- via: pushState

## 2026-08-11 11:29:02.963Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 11:29:02.964Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 11:29:03.076Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:03.084Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447224830:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:03.085Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:03.386Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:07.976Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:08.596Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 124

## 2026-08-11 11:29:08.605Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:08.606Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:08.625Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:08.632Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:08.633Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:08.934Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:12.305Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:12.627Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:12.631Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:12.631Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:12.635Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 71

## 2026-08-11 11:29:12.635Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:12.636Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:12.932Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:13.515Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:13.919Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:13.922Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:13.922Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:13.927Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 113

## 2026-08-11 11:29:13.928Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:13.928Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:14.224Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:14.619Z console.warn
- text: [Perf] Low FPS detected: 52

## 2026-08-11 11:29:15.064Z navigate
- url: http://localhost:3000/dashboard#portfolio
- via: popstate

## 2026-08-11 11:29:17.007Z load
- url: http://localhost:3000/dashboard#portfolio

## 2026-08-11 11:29:17.327Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 37

## 2026-08-11 11:29:17.328Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:17.328Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:19.526Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 11:29:19.527Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 11:29:19.700Z console.error
- text: 
    Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.%s 723364de-9f4a-4e1b-97f5-aa4aa1f01927-28/6/26 18:53:54-BTC-USD 
        at tbody
        at table
        at div
        at div
        at div
        at div
        at OrdersView (http://localhost:3000/src/views/OrdersView.jsx?t=1786445146835:181:27)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App

## 2026-08-11 11:29:19.700Z console.error
- text: 
    Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.%s 723364de-9f4a-4e1b-97f5-aa4aa1f01927-28/6/26 18:53:54-BTC-USD 
        at tbody
        at table
        at div
        at div
        at div
        at div
        at OrdersView (http://localhost:3000/src/views/OrdersView.jsx?t=1786445146835:181:27)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App

## 2026-08-11 11:29:20.808Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Analysis"}

## 2026-08-11 11:29:20.808Z navigate
- url: http://localhost:3000/dashboard#analysis
- via: pushState

## 2026-08-11 11:29:22.070Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"AI Signals"}

## 2026-08-11 11:29:22.071Z navigate
- url: http://localhost:3000/dashboard#signals
- via: pushState

## 2026-08-11 11:29:23.464Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Markets"}

## 2026-08-11 11:29:23.464Z navigate
- url: http://localhost:3000/dashboard#markets
- via: pushState

## 2026-08-11 11:29:24.708Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Dashboard"}

## 2026-08-11 11:29:24.709Z navigate
- url: http://localhost:3000/dashboard
- via: pushState

## 2026-08-11 11:29:24.957Z console.warn
- text: [Perf] Worker took 176.3ms (target <50ms)

## 2026-08-11 11:29:25.274Z console.warn
- text: [Perf] Low FPS detected: 53

## 2026-08-11 11:29:26.687Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Portfolio"}

## 2026-08-11 11:29:26.688Z navigate
- url: http://localhost:3000/dashboard#portfolio
- via: pushState

## 2026-08-11 11:29:28.371Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trading"}

## 2026-08-11 11:29:28.372Z navigate
- url: http://localhost:3000/dashboard#trading
- via: pushState

## 2026-08-11 11:29:28.429Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:28.431Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:28.432Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:28.732Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:35.646Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:36.041Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:36.043Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:36.044Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:36.048Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 68

## 2026-08-11 11:29:36.048Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:36.048Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:36.344Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:37.892Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:38.208Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:38.210Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:38.210Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:38.213Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 55

## 2026-08-11 11:29:38.214Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:38.214Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:38.511Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:38.939Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:39.275Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:39.277Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:39.277Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:39.282Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 88

## 2026-08-11 11:29:39.282Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:39.282Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:39.579Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:39.787Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:40.097Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:40.099Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:40.099Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:40.102Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 53

## 2026-08-11 11:29:40.102Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:40.103Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:40.399Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:40.693Z load
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:41.027Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 16718
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:41.031Z console.error
- text: 
    The above error occurred in the <TradingView> component:
    
        at TradingView (http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:167:37)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App
    
    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

## 2026-08-11 11:29:41.032Z window.error
- message: Uncaught TypeError: mainChart.addCandlestickSeries is not a function
- source: http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b
- line: 9176
- col: 15
- stack: 
    TypeError: mainChart.addCandlestickSeries is not a function
        at http://localhost:3000/src/views/TradingView.jsx?t=1786446809478:469:36
        at commitHookEffectListMount (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:16963:34)
        at commitPassiveMountOnFiber (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18206:19)
        at commitPassiveMountEffects_complete (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18179:17)
        at commitPassiveMountEffects_begin (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18169:15)
        at commitPassiveMountEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:18159:11)
        at flushPassiveEffectsImpl (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19543:11)
        at flushPassiveEffects (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19500:22)
        at http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:19381:17
        at workLoop (http://localhost:3000/node_modules/.vite/deps/chunk-CZ7DXAHC.js?v=547f541b:197:42)

## 2026-08-11 11:29:41.036Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 88

## 2026-08-11 11:29:41.036Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:41.036Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:41.334Z root.empty
- url: http://localhost:3000/dashboard#trading

## 2026-08-11 11:29:41.772Z console.warn
- text: [Perf] Low FPS detected: 54

## 2026-08-11 11:29:42.394Z navigate
- url: http://localhost:3000/dashboard#portfolio
- via: popstate

## 2026-08-11 11:29:44.635Z load
- url: http://localhost:3000/dashboard#portfolio

## 2026-08-11 11:29:44.932Z network.error
- method: GET
- url: http://localhost:3000/hcgi/api/ecommerce/subscriptions
- status: 503
- statusText: Service Unavailable
- response: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}
- durationMs: 34

## 2026-08-11 11:29:44.945Z console.error
- text: Fetch error from http://localhost:3000/hcgi/api/ecommerce/subscriptions: {"error":"Subscription service is temporarily unavailable. Please retry.","code":"SUBSCRIPTIONS_UNAVAILABLE","subscriptions":[]}

## 2026-08-11 11:29:44.945Z console.error
- text: 
    Failed to fetch subscriptions: Error: Failed to fetch subscriptions: 503
        at getUserSubscriptions (http://localhost:3000/src/api/InternalEcommerceSubscriptionsApi.js:29:9)
        at async SubscriptionAuthProvider.fetchSubscriptionsRef.current (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:20:19)

## 2026-08-11 11:29:45.722Z console.warn
- text: [Perf] Low FPS detected: 54

## 2026-08-11 11:30:10.306Z console.warn
- text: [Perf] Low FPS detected: 2

## 2026-08-11 11:30:12.397Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 11:30:12.398Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 11:30:13.641Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:30:13.642Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:30:16.615Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 11:30:16.616Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-11 11:31:39.430Z console.warn
- text: [Perf] Low FPS detected: 1

## 2026-08-11 11:31:42.063Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:31:42.063Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:31:43.128Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"News Intelligence"}

## 2026-08-11 11:31:43.129Z navigate
- url: http://localhost:3000/dashboard#news
- via: pushState

## 2026-08-11 11:31:45.200Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 11:31:45.200Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 11:31:45.443Z console.error
- text: 
    Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.%s 723364de-9f4a-4e1b-97f5-aa4aa1f01927-28/6/26 18:53:54-BTC-USD 
        at tbody
        at table
        at div
        at div
        at div
        at div
        at OrdersView (http://localhost:3000/src/views/OrdersView.jsx?t=1786445146835:181:27)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App

## 2026-08-11 11:31:45.443Z console.error
- text: 
    Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.%s 723364de-9f4a-4e1b-97f5-aa4aa1f01927-28/6/26 18:53:54-BTC-USD 
        at tbody
        at table
        at div
        at div
        at div
        at div
        at OrdersView (http://localhost:3000/src/views/OrdersView.jsx?t=1786445146835:181:27)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App

## 2026-08-11 11:31:45.630Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Portfolio"}

## 2026-08-11 11:31:45.630Z navigate
- url: http://localhost:3000/dashboard#portfolio
- via: pushState

## 2026-08-11 11:31:48.636Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Orders"}

## 2026-08-11 11:31:48.636Z navigate
- url: http://localhost:3000/dashboard#orders
- via: pushState

## 2026-08-11 11:31:48.790Z console.error
- text: 
    Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.%s 723364de-9f4a-4e1b-97f5-aa4aa1f01927-28/6/26 18:53:54-BTC-USD 
        at tbody
        at table
        at div
        at div
        at div
        at div
        at OrdersView (http://localhost:3000/src/views/OrdersView.jsx?t=1786445146835:181:27)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App

## 2026-08-11 11:31:48.790Z console.error
- text: 
    Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.%s 723364de-9f4a-4e1b-97f5-aa4aa1f01927-28/6/26 18:53:54-BTC-USD 
        at tbody
        at table
        at div
        at div
        at div
        at div
        at OrdersView (http://localhost:3000/src/views/OrdersView.jsx?t=1786445146835:181:27)
        at div
        at main
        at div
        at PremiumDashboard (http://localhost:3000/src/pages/PremiumDashboard.jsx?t=1786447650293:234:20)
        at ProtectedRoute (http://localhost:3000/src/components/ProtectedRoute.jsx:6:27)
        at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:6647:26)
        at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7572:3)
        at SubscriptionAuthProvider (http://localhost:3000/src/contexts/SubscriptionAuthContext.jsx:7:44)
        at AuthProvider (http://localhost:3000/src/contexts/AuthContext.jsx:12:32)
        at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:7511:13)
        at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=547f541b:10816:3)
        at App

## 2026-08-11 11:31:49.913Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"News Intelligence"}

## 2026-08-11 11:31:49.914Z navigate
- url: http://localhost:3000/dashboard#news
- via: pushState

## 2026-08-11 11:31:51.213Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Smart Money"}

## 2026-08-11 11:31:51.213Z navigate
- url: http://localhost:3000/dashboard#smartmoney
- via: pushState

## 2026-08-11 11:31:52.456Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Economic Calendar"}

## 2026-08-11 11:31:52.456Z navigate
- url: http://localhost:3000/dashboard#calendar
- via: pushState

## 2026-08-11 11:31:53.931Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Analytics"}

## 2026-08-11 11:31:53.931Z navigate
- url: http://localhost:3000/dashboard#analytics
- via: pushState

## 2026-08-11 11:31:55.446Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 11:31:55.446Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

## 2026-08-11 11:31:56.479Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Deposits"}

## 2026-08-11 11:31:56.480Z navigate
- url: http://localhost:3000/dashboard#deposits
- via: pushState

## 2026-08-11 11:31:58.248Z click
- element: {"tag":"a","role":null,"ariaLabel":null,"name":null,"type":null,"id":null,"placeholder":null,"label":null,"value":null,"valueLength":0,"text":"Trade History"}

## 2026-08-11 11:31:58.248Z navigate
- url: http://localhost:3000/dashboard#trade-history
- via: pushState

