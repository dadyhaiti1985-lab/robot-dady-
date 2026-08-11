import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CredentialsTester = () => {
  const { currentUser } = useAuth();
  const [testStatus, setTestStatus] = useState({
    coinbase: 'idle',
    telegram: 'idle',
    gemini: 'idle'
  });

  const simulateTest = async (service, dependencies) => {
    setTestStatus(prev => ({ ...prev, [service]: 'testing' }));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if dependencies actually exist in currentUser
    const hasDependencies = dependencies.every(dep => currentUser && currentUser[dep] && currentUser[dep].length > 0);
    
    setTestStatus(prev => ({ 
      ...prev, 
      [service]: hasDependencies ? 'success' : 'error' 
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))]" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted border-dashed" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'testing': return 'Ap teste...';
      case 'success': return 'Konekte ✓';
      case 'error': return 'Echwe ✗';
      default: return 'Pa teste';
    }
  };

  const renderTestRow = (title, service, dependencies) => {
    const status = testStatus[service];
    
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 gap-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(status)}
          <div>
            <p className="font-medium text-foreground">{title}</p>
            {status === 'error' && (
              <p className="text-sm text-destructive mt-1">
                Kredansyal yo pa valab oswa yo manke. Tanpri verifye yo.
              </p>
            )}
            {status === 'success' && (
              <p className="text-sm text-[hsl(var(--success))] mt-1">
                Koneksyon an reyisi.
              </p>
            )}
          </div>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => simulateTest(service, dependencies)}
          disabled={status === 'testing'}
          className="sm:w-auto w-full shrink-0"
        >
          Teste Koneksyon
        </Button>
      </div>
    );
  };

  const lastUpdated = currentUser?.updated ? new Date(currentUser.updated).toLocaleString('fr-HT', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  }) : 'Pa janm';

  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-secondary" />
              <span>Tès Koneksyon</span>
            </CardTitle>
            <CardDescription>
              Verifye si sistèm nan ka kominike ak sèvis ekstèn yo.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            <span>Dènye Mizajou: {lastUpdated}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {renderTestRow('Coinbase Pro API', 'coinbase', ['apiKey', 'apiSecret'])}
        {renderTestRow('Telegram Notifikasyon', 'telegram', ['telegramToken', 'telegramChatId'])}
        {renderTestRow('Google Gemini AI', 'gemini', ['geminiApiKey'])}
      </CardContent>
    </Card>
  );
};

export default CredentialsTester;