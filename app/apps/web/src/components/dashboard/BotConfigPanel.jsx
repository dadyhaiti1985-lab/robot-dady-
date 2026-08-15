import { authApiFetch } from '@/lib/authApi';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const BotConfigPanel = ({ currentConfig, userId, onConfigUpdate }) => {
  const [config, setConfig] = useState({
    riskPerTrade: 1.5,
    maxConcurrentPositions: 3,
    dailyLossLimit: 5,
    trailingStopPercent: 50,
    assetRotationEnabled: true,
    timeframeWeights: {
      "15m": 30,
      "4h": 40,
      "1D": 30
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentConfig) {
      setConfig({
        riskPerTrade: currentConfig.riskPerTrade || 1.5,
        maxConcurrentPositions: currentConfig.maxConcurrentPositions || 3,
        dailyLossLimit: currentConfig.dailyLossLimit || 5,
        trailingStopPercent: currentConfig.trailingStopPercent || 50,
        assetRotationEnabled: currentConfig.assetRotationEnabled ?? true,
        timeframeWeights: currentConfig.timeframeWeights || { "15m": 30, "4h": 40, "1D": 30 }
      });
    }
  }, [currentConfig]);

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleWeightChange = (tf, value) => {
    setConfig(prev => {
      const newWeights = { ...prev.timeframeWeights, [tf]: value[0] };
      // Optional: Normalize weights to 100% implicitly or let user do it. Let's let user do it for simplicity.
      return { ...prev, timeframeWeights: newWeights };
    });
  };

  const handleSave = async () => {
    // Validate weights
    const sum = config.timeframeWeights["15m"] + config.timeframeWeights["4h"] + config.timeframeWeights["1D"];
    if (sum !== 100) {
      toast.error(`Pwa tan yo dwe total 100%. Kounye a li fè ${sum}%.`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await authApiFetch('/bot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...config })
      });
      
      if (!res.ok) throw new Error('Failed to save config');
      
      toast.success('Konfigirasyon sove avèk siksè.');
      if (onConfigUpdate) onConfigUpdate();
    } catch (err) {
      toast.error('Erè nan sove konfigirasyon an.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      riskPerTrade: 1.5,
      maxConcurrentPositions: 3,
      dailyLossLimit: 5,
      trailingStopPercent: 50,
      assetRotationEnabled: true,
      timeframeWeights: { "15m": 30, "4h": 40, "1D": 30 }
    });
    toast.info('Retounen nan paramèt defo. Klike Sove pou aplike.');
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Paramèt Avanse Robo a</span>
        </CardTitle>
        <CardDescription>Ajiste risk, jesyon pozisyon, ak enpòtans tan-yo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Risk Management */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Jesyon Risk</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Risk pou chak komès</Label>
                <span className="text-sm font-medium">{config.riskPerTrade}%</span>
              </div>
              <Slider 
                value={[config.riskPerTrade]} 
                min={0.5} max={3} step={0.1} 
                onValueChange={(v) => handleChange('riskPerTrade', v[0])} 
              />
              <p className="text-xs text-muted-foreground">Pousantaj kapital total riske pa komès.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Limit Pèt Chak Jou</Label>
                <span className="text-sm font-medium">{config.dailyLossLimit}%</span>
              </div>
              <Slider 
                value={[config.dailyLossLimit]} 
                min={2} max={10} step={0.5} 
                onValueChange={(v) => handleChange('dailyLossLimit', v[0])} 
              />
            </div>
            
            <div className="space-y-3">
              <Label className="block mb-2">Max Pozisyon Anmenmtan</Label>
              <Select value={config.maxConcurrentPositions.toString()} onValueChange={(v) => handleChange('maxConcurrentPositions', parseInt(v))}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map(num => <SelectItem key={num} value={num.toString()}>{num} pozisyon</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Strategy & Rotation */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Estrateji ak Wotasyon</h3>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-base">Wotasyon Byen (Asset Rotation)</Label>
                <p className="text-xs text-muted-foreground">Chanje byen otomatikman selon momantòm.</p>
              </div>
              <Switch 
                checked={config.assetRotationEnabled} 
                onCheckedChange={(v) => handleChange('assetRotationEnabled', v)} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Trailing Stop (Pousantaj pwofi sekirize)</Label>
                <span className="text-sm font-medium">{config.trailingStopPercent}%</span>
              </div>
              <Slider 
                value={[config.trailingStopPercent]} 
                min={0} max={100} step={5} 
                onValueChange={(v) => handleChange('trailingStopPercent', v[0])} 
              />
            </div>

            <div className="space-y-4 pt-2">
              <Label className="block border-b border-border/50 pb-2 text-xs uppercase text-muted-foreground">Pwa Tan (Dwe total 100%)</Label>
              
              <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-3 items-center">
                <span className="text-sm font-medium w-8">15m</span>
                <Slider value={[config.timeframeWeights["15m"]]} min={0} max={100} step={5} onValueChange={(v) => handleWeightChange("15m", v)} />
                <span className="text-sm tabular-nums text-right w-8">{config.timeframeWeights["15m"]}%</span>

                <span className="text-sm font-medium w-8">4h</span>
                <Slider value={[config.timeframeWeights["4h"]]} min={0} max={100} step={5} onValueChange={(v) => handleWeightChange("4h", v)} />
                <span className="text-sm tabular-nums text-right w-8">{config.timeframeWeights["4h"]}%</span>

                <span className="text-sm font-medium w-8">1D</span>
                <Slider value={[config.timeframeWeights["1D"]]} min={0} max={100} step={5} onValueChange={(v) => handleWeightChange("1D", v)} />
                <span className="text-sm tabular-nums text-right w-8">{config.timeframeWeights["1D"]}%</span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border/50 pt-6">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" /> Defo
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Ap Sove...' : <><Save className="w-4 h-4 mr-2" /> Sove Konfigirasyon</>}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BotConfigPanel;