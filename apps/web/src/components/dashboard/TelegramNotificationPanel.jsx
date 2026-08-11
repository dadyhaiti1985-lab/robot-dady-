import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Trash2, ArrowRightLeft, ShieldAlert, Activity, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const getIconForType = (type) => {
  switch(type) {
    case 'trade_open': return <Activity className="w-4 h-4 text-info" />;
    case 'trade_close': return <DollarSign className="w-4 h-4 text-success" />;
    case 'rotation': return <ArrowRightLeft className="w-4 h-4 text-primary" />;
    case 'risk_alert': return <ShieldAlert className="w-4 h-4 text-danger" />;
    default: return <MessageCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

const TelegramNotificationPanel = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const records = await pb.collection('bot_notifications').getList(1, 15, {
        filter: `userId = "${currentUser.id}"`,
        sort: '-timestamp',
        $autoCancel: false
      });
      setNotifications(records.items);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time changes if possible, or just poll
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const clearHistory = async () => {
    if (!window.confirm("Efase tout istorik notifikasyon?")) return;
    // For safety and speed in this demo environment, we just hide them locally. 
    // In a full app, you'd batch delete or mark as read via API.
    setNotifications([]);
  };

  return (
    <Card className="h-[600px] flex flex-col border-border">
      <CardHeader className="pb-3 border-b border-border/50 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <MessageCircle className="w-5 h-5 mr-2 text-primary" />
            Notifikasyon Bot
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={clearHistory} title="Efase">
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-danger" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Pa gen nouvo notifikasyon</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 p-2 rounded-full bg-background border border-border">
                      {getIconForType(notif.notificationType)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notif.notificationType.replace('_', ' ').toUpperCase()}
                        {notif.asset && <span className="ml-2 text-primary">{notif.asset}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground break-words">{notif.message}</p>
                      <p className="text-xs text-muted-foreground/60 pt-1">
                        {new Date(notif.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TelegramNotificationPanel;