import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import CredentialCard from '@/components/settings/CredentialCard.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCredentialAutoSave } from '@/hooks/useCredentialAutoSave.js';
import { useCredentialTest } from '@/hooks/useCredentialTest.js';
import pb from '@/lib/pocketbaseClient';
import { ShieldCheck } from 'lucide-react';

const CREDENTIALS_CONFIG = [
  { key: 'apiKey', name: 'Coinbase API Key' },
  { key: 'apiSecret', name: 'Coinbase API Secret' },
  { key: 'telegramToken', name: 'Telegram Bot Token' },
  { key: 'telegramChatId', name: 'Telegram Chat ID' },
  { key: 'geminiApiKey', name: 'Gemini API Key' }
];

const CredentialsChecklistPage = () => {
  const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState({});
  const [lastUpdated, setLastUpdated] = useState({});
  const [loading, setLoading] = useState(true);

  const { saveState, updateCredential } = useCredentialAutoSave(currentUser?.id);
  const { testState, testCredential } = useCredentialTest();

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!currentUser?.id) return;
      try {
        const user = await pb.collection('users').getOne(currentUser.id, { $autoCancel: false });
        
        const creds = {};
        const updated = {};
        CREDENTIALS_CONFIG.forEach(config => {
          creds[config.key] = user[config.key] || '';
          updated[config.key] = user.updated;
        });
        
        setCredentials(creds);
        setLastUpdated(updated);
      } catch (error) {
        console.error('Error fetching credentials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [currentUser]);

  const handleInputChange = (key, value) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
    updateCredential(key, value);
    setLastUpdated(prev => ({ ...prev, [key]: new Date().toISOString() }));
  };

  const handleDelete = (key) => {
    handleInputChange(key, '');
  };

  const getStatus = (key) => {
    if (testState[key] === 'testing') return 'testing';
    if (testState[key] === 'success') return 'valid';
    if (testState[key] === 'error') return 'missing';
    
    // Fallback to checking if it exists
    if (credentials[key] && credentials[key].length > 0) {
      return 'valid'; // Assume valid if it exists and hasn't been tested yet
    }
    return 'empty';
  };

  return (
    <>
      <Helmet>
        <title>Kredansyal - Robo Komèsyal</title>
        <meta name="description" content="Jere tout kredansyal ak kle API ou yo nan yon sèl kote" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold" style={{letterSpacing: '-0.02em'}}>Lis Kredansyal</h1>
            </div>
            <p className="text-muted-foreground mt-2">
              Jere tout kle API ak token ou yo. Sistèm nan ap sove chanjman ou yo otomatikman.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              CREDENTIALS_CONFIG.map((config) => (
                <CredentialCard
                  key={config.key}
                  credentialName={config.name}
                  credentialKey={config.key}
                  currentValue={credentials[config.key]}
                  status={getStatus(config.key)}
                  saveStatus={saveState[config.key]}
                  lastUpdated={lastUpdated[config.key]}
                  onInputChange={handleInputChange}
                  onTest={testCredential}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CredentialsChecklistPage;