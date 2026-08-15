import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRightLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AssetRotationHistory = ({ rotations, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Istorik Wotasyon</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          <span>Istorik Wotasyon Aktif</span>
        </CardTitle>
        <CardDescription>Dènye fwa robo a chanje byen pou jwenn pi bon momantòm.</CardDescription>
      </CardHeader>
      <CardContent>
        {!rotations || rotations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Pa gen okenn wotasyon ki anrejistre poko.
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {rotations.map((rotation, index) => {
              const isMomentumGain = rotation.toMomentum > rotation.fromMomentum;
              
              return (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-primary z-10">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(rotation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-muted-foreground">{rotation.fromAsset}</p>
                        <p className={`text-xs flex items-center justify-center ${rotation.fromMomentum >= 0 ? 'text-success' : 'text-danger'}`}>
                          {rotation.fromMomentum >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {rotation.fromMomentum?.toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="px-2 text-muted-foreground">→</div>
                      
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{rotation.toAsset}</p>
                        <p className={`text-xs flex items-center justify-center ${rotation.toMomentum >= 0 ? 'text-success' : 'text-danger'}`}>
                          {rotation.toMomentum >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {rotation.toMomentum?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground italic">Rezon: {rotation.reason}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetRotationHistory;