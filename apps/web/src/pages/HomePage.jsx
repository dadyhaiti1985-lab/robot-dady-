import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Zap, Shield, TrendingUp, BarChart3 } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>RoboKripto - Oto-Komès Kripto 24/7</title>
        <meta name="description" content="Sistèm oto-komès avanse pou mache kriptografik la." />
      </Helmet>
      
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden flex items-center justify-center min-h-[90dvh]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
          
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground">
                Miltipliye Kripto ou ak <span className="text-primary">Oto-Komès</span> Entelijan
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Kite robo nou an travay pou ou 24/7. Avèk estrateji avanse, jesyon risk entegre, ak yon mòd tès (papye) pou pratike san risk.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
                    Kòmanse Kounye a <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="secondary" className="h-12 px-8 text-base w-full sm:w-auto">
                    Konekte
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Poukisa Chwazi RoboKripto?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Sistèm konplè pou pwoteje ak grandi kapital ou a nan mache kripto a.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Bot, title: "Oto-Komès 24/7", desc: "Robo a pa janm dòmi. Li analize mache a chak segonn pou jwenn opòtinite." },
                { icon: Zap, title: "4 Estrateji Avanse", desc: "Swiv tandans, retou nan mwayèn, scalping oswa swing trading. Chwazi sa k bon pou ou." },
                { icon: Shield, title: "Jesyon Risk Entegre", desc: "Circuit breaker ak stop-loss otomatik pou pwoteje kont volatilité ekstrèm." },
                { icon: BarChart3, title: "Mòd Papye (Tès)", desc: "Teste estrateji yo avèk $50,000 lajan fiktif anvan ou envesti lajan reyèl." },
                { icon: TrendingUp, title: "Analiz Pwofon", desc: "Swiv pwofi ak pèt ou (PnL) avèk grafik detaye ak istorik klè." },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;