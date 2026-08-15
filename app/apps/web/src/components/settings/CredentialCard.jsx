import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Activity, Trash2, Clock, CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react';

const CredentialCard = ({ 
  credentialName, 
  credentialKey, 
  currentValue, 
  status, // 'valid' | 'missing' | 'testing' | 'empty'
  saveStatus, // 'saving' | 'success' | 'error' | null
  lastUpdated, 
  onInputChange, 
  onTest, 
  onDelete 
}) => {
  const [showValue, setShowValue] = useState(false);
  const [localValue, setLocalValue] = useState(currentValue || '');

  useEffect(() => {
    setLocalValue(currentValue || '');
  }, [currentValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    onInputChange(credentialKey, val);
  };

  const getStatusDisplay = () => {
    if (status === 'testing') return { icon: Loader2, color: 'text-[hsl(var(--status-testing))]', text: 'Pandan teste', animate: 'animate-spin' };
    if (status === 'valid') return { icon: CheckCircle2, color: 'text-[hsl(var(--status-valid))]', text: 'Valide', animate: '' };
    if (status === 'missing') return { icon: XCircle, color: 'text-[hsl(var(--status-missing))]', text: 'Manke', animate: '' };
    return { icon: Circle, color: 'text-[hsl(var(--status-empty))]', text: 'Gri', animate: '' };
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <Card className="overflow-hidden border-border/50 hover:border-border transition-colors duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          {/* Left Section: Info & Input */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{credentialName}</h3>
              <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1 rounded-full">
                <StatusIcon className={`w-4 h-4 ${statusDisplay.color} ${statusDisplay.animate} status-indicator`} />
                <span className={`text-sm font-medium ${statusDisplay.color}`}>
                  {statusDisplay.text}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="password-input-wrapper">
                <Input
                  type={showValue ? "text" : "password"}
                  value={localValue}
                  onChange={handleChange}
                  placeholder={`Antre ${credentialName}`}
                  className="pr-10 bg-background/50 focus:bg-background transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowValue(!showValue)}
                  className="password-toggle-btn"
                  aria-label={showValue ? "Kache" : "Montre"}
                >
                  {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Save Status Indicator */}
              <div className="h-5 flex items-center">
                {saveStatus === 'saving' && <span className="text-xs text-muted-foreground animate-pulse">Sove...</span>}
                {saveStatus === 'success' && <span className="text-xs text-[hsl(var(--status-valid))]">✓ Sove</span>}
                {saveStatus === 'error' && <span className="text-xs text-[hsl(var(--status-missing))]">✗ Erè pandan sove</span>}
              </div>
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:w-48 shrink-0">
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => onTest(credentialKey, localValue)}
              disabled={!localValue || status === 'testing'}
            >
              <Activity className="w-4 h-4 mr-2" />
              Teste
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(credentialKey)}
              disabled={!localValue}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Efase
            </Button>

            <div className="flex items-center text-xs text-muted-foreground mt-auto pt-2">
              <Clock className="w-3 h-3 mr-1" />
              {lastUpdated ? new Date(lastUpdated).toLocaleDateString('fr-HT') : 'Pa janm'}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default CredentialCard;