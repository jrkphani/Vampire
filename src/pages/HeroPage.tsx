import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Award, Zap, Star, ArrowRight, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Reusable Value Card Component
interface ValueCardProps {
  icon: React.ReactNode;
  headline: string;
  description: string;
}

function ValueCard({ icon, headline, description }: ValueCardProps) {
  return (
    <div className="bg-surface/80 backdrop-blur-sm rounded-xl p-6 hover:bg-surface transition-all duration-300 border border-border">
      <div className="flex items-center justify-center w-12 h-12 bg-brand-red/10 rounded-lg mb-4">
        {icon}
      </div>
      <h3 className="text-h3 text-text-primary mb-3">{headline}</h3>
      <p className="text-body text-text-secondary">{description}</p>
    </div>
  );
}

// Trust Badge Component
interface TrustBadgeProps {
  icon: React.ReactNode;
  text: string;
}

function TrustBadge({ icon, text }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
      <div className="text-brand-red">{icon}</div>
      <span className="text-body-small text-text-primary font-medium">{text}</span>
    </div>
  );
}

export function HeroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-h2 text-primary-main font-bold">ValueMax</h1>
            <p className="text-body-small text-text-secondary">Vampire System</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/login">
            Staff Login
          </Link>
        </Button>
      </header>

      {/* Hero Section */}
      <main className="relative">
        {/* Trust Badge Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-8">
          <TrustBadge icon={<Award className="h-4 w-4" />} text="Est. 1987" />
          <TrustBadge icon={<BarChart3 className="h-4 w-4" />} text="51 Outlets" />
          <TrustBadge icon={<Users className="h-4 w-4" />} text="200+ Staff" />
          <TrustBadge icon={<Star className="h-4 w-4" />} text="99.9% Uptime" />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-5 gap-6 items-center">
            {/* Left Content (60%) */}
            <div className="lg:col-span-3 space-y-8">
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-display text-primary-main">
                  35 Years of Trust.
                  <br />
                  <span className="text-brand-red">Operations That Scale.</span>
                </h1>
                <p className="text-h2 text-text-secondary max-w-2xl">
                  From single transactions to multi-outlet coordination, ValueMax's digital operations platform grows with your business success.
                </p>
              </div>

              {/* Call-to-Action Row */}
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="primary" size="lg" className="text-lg px-8 py-4">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2"
                  >
                    See It Work
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="tertiary" size="lg" className="text-lg px-8 py-4">
                  Talk to Our Team
                </Button>
              </div>
            </div>

            {/* Right Visual (40%) */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
                  <div className="bg-slate-900 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-[var(--color-error)] rounded-full"></div>
                      <div className="w-3 h-3 bg-[var(--color-warning)] rounded-full"></div>
                      <div className="w-3 h-3 bg-[var(--color-success)] rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-[var(--color-info)] rounded w-3/4"></div>
                      <div className="h-3 bg-[var(--color-text-muted)] rounded w-1/2"></div>
                      <div className="h-3 bg-[var(--color-success)] rounded w-2/3"></div>
                    </div>
                  </div>
                  <p className="text-text-secondary text-body-small text-center">
                    Modern interface, familiar workflows
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Three-Column Value Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <ValueCard
              icon={<TrendingUp className="h-6 w-6 text-brand-red" />}
              headline="Scale Confidently"
              description="Handle 3x more transactions without adding complexity. Our system grows from single outlets to enterprise operations."
            />
            <ValueCard
              icon={<Shield className="h-6 w-6 text-brand-red" />}
              headline="Built on Experience"
              description="35 years of pawnshop expertise translated into digital workflows. Every feature tested by real outlet operations."
            />
            <ValueCard
              icon={<Zap className="h-6 w-6 text-brand-red" />}
              headline="Stay Ahead"
              description="Process renewals 40% faster. Unify branch operations. Turn expertise into competitive advantage."
            />
          </div>

          {/* Social Proof Section */}
          <div className="mt-20 bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-border">
            <div className="max-w-4xl mx-auto text-center">
              <blockquote className="text-h2 text-text-primary leading-relaxed mb-6">
                "After 15 years managing outlets, this is the first system that actually makes us faster, not slower. It feels like ValueMax built it themselves."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SC</span>
                </div>
                <div className="text-left">
                  <p className="text-body text-text-primary font-semibold">Sarah Chen</p>
                  <p className="text-body-small text-text-secondary">Senior Outlet Manager, Chinatown Branch</p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Metrics */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-h1 text-brand-red mb-2">99.9%</div>
              <div className="text-body-small text-text-secondary">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-h1 text-brand-red mb-2">40%</div>
              <div className="text-body-small text-text-secondary">Faster Processing</div>
            </div>
            <div className="text-center">
              <div className="text-h1 text-brand-red mb-2">51</div>
              <div className="text-body-small text-text-secondary">Outlets Connected</div>
            </div>
            <div className="text-center">
              <div className="text-h1 text-brand-red mb-2">Zero</div>
              <div className="text-body-small text-text-secondary">Training Required</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-body-small text-text-secondary">
              © 2024 ValueMax. Professional pawnshop operations since 1987.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}