import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CredentialsRevoke = () => {
  const { currentUser } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    setLoading(true);
    try {
      await pb.collection('users').update(currentUser.id, {
        apiKey: null,
        apiSecret: null,
        telegramToken: null,
        telegramChatId: null,
        geminiApiKey: null
      }, { $autoCancel: false });
      
      toast.success('Tout kredansyal yo efase avèk siksè');
      setShowConfirm(false);
    } catch (error) {
      console.error('Revoke error:', error);
      toast.error('Erè pandan efase kredansyal yo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <span>Zòn Danje: Revoke Kredansyal</span>
        </CardTitle>
        <CardDescription className="text-foreground/80">
          Efase tout kle API ak token ki sove nan sistèm nan. Sa ap kanpe tout komès otomatik ak notifikasyon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showConfirm ? (
          <Button 
            variant="destructive" 
            onClick={() => setShowConfirm(true)}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Revoke Tout Kredansyal
          </Button>
        ) : (
          <div className="p-4 rounded-lg border border-destructive/50 bg-background/50 space-y-4">
            <p className="font-medium text-foreground">
              Ou sèten ou vle revoke tout kredansyal yo?
            </p>
            <p className="text-sm text-muted-foreground">
              Aksyon sa a ap efase tout kle API ou yo imedyatman. Ou pral oblije re-antre yo pou kontinye itilize robo a.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <Button 
                variant="destructive" 
                onClick={handleRevoke}
                disabled={loading}
              >
                {loading ? 'Ap efase...' : 'Wi, Revoke'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Anile
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CredentialsRevoke;