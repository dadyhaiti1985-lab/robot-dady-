import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Key, Eye, EyeOff, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CredentialsForm = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    telegramToken: '',
    telegramChatId: '',
    geminiApiKey: ''
  });

  const [showValues, setShowValues] = useState({
    apiKey: false,
    apiSecret: false,
    telegramToken: false,
    telegramChatId: false,
    geminiApiKey: false
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        apiKey: currentUser.apiKey || '',
        apiSecret: currentUser.apiSecret || '',
        telegramToken: currentUser.telegramToken || '',
        telegramChatId: currentUser.telegramChatId || '',
        geminiApiKey: currentUser.geminiApiKey || ''
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (field) => {
    setShowValues(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await pb.collection('users').update(currentUser.id, formData, { $autoCancel: false });
      toast.success('Kredansyal yo anrejistre avèk siksè');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erè nan anrejistreman kredansyal yo');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (id, label, placeholder) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="password-input-wrapper">
        <Input
          id={id}
          name={id}
          type={showValues[id] ? "text" : "password"}
          value={formData[id]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-10 bg-background text-foreground"
        />
        <button
          type="button"
          onClick={() => toggleVisibility(id)}
          className="password-toggle-btn"
          aria-label={showValues[id] ? "Kache" : "Montre"}
        >
          {showValues[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <Card className="border-border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>Jesyon Kredansyal</span>
        </CardTitle>
        <CardDescription>
          Sove kle API ak tokens ou yo an sekirite. Tout done yo kode nan bazdone a.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Coinbase Pro</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderPasswordField('apiKey', 'Kle API (API Key)', 'Antre kle API Coinbase')}
              {renderPasswordField('apiSecret', 'Sekrè API (API Secret)', 'Antre sekrè API Coinbase')}
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Telegram Bot</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderPasswordField('telegramToken', 'Token Bot', 'Eg: 123456:ABC-DEF...')}
              {renderPasswordField('telegramChatId', 'Chat ID', 'Eg: 123456789')}
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Google Gemini AI</span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {renderPasswordField('geminiApiKey', 'Kle API Gemini', 'Antre kle API Gemini pou analiz')}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Ap Sove...' : 'Sove Kredansyal yo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CredentialsForm;