import { Dumbbell, Activity, Heart, Shield, Target, Utensils, Stethoscope, ChefHat, Zap } from 'lucide-react';

/**
 * FloatingBackground — Renders subtle, animated SVG shapes
 * and a central branding watermark that float behind the content.
 */
export default function FloatingBackground({ role = 'customer' }) {
  const shapes = SHAPES[role] || SHAPES.customer;

  return (
    <>
      <div className="grain-overlay" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* Central Branding Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none">
        <div className="text-center animate-scale-in">
          <h1 className="logo-fitti text-[25vw] leading-none">Fitti</h1>
          <p className="motto-fitti text-[2vw] uppercase tracking-[0.5em] mt-4">Evolve Your Fitness</p>
        </div>
      </div>

      {/* Floating Shapes */}
      {shapes.map((item, i) => (
        <div
          key={i}
          className={`absolute opacity-[0.04] text-fitti-green ${item.className}`}
          style={{ 
            top: item.top, 
            left: item.left, 
            right: item.right, 
            bottom: item.bottom,
            animationDelay: `${i * 0.7}s`,
            animationDuration: item.duration || '15s'
          }}
        >
          {item.icon}
        </div>
      ))}

      {/* EKG Pulse Lines */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" className="text-fitti-green">
          <path 
            d="M 0 500 L 200 500 L 220 480 L 240 520 L 260 500 L 500 500 L 520 400 L 540 600 L 560 500 L 1000 500" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="animate-pulse-soft"
            style={{ animationDuration: '3s' }}
          />
        </svg>
      </div>
      </div>
    </>
  );
}

const SHAPES = {
  customer: [
    { icon: <Dumbbell size={180} />, className: 'animate-float', top: '15%', left: '10%' },
    { icon: <ChefHat size={140} />, className: 'animate-float', top: '55%', right: '15%' },
    { icon: <Stethoscope size={160} />, className: 'animate-float', bottom: '15%', left: '20%' },
    { icon: <Target size={120} />, className: 'animate-float', top: '40%', left: '45%' },
    { icon: <Activity size={100} />, className: 'animate-pulse-soft', top: '10%', right: '25%' },
  ],
  trainer: [
    { icon: <Dumbbell size={220} />, className: 'animate-float', top: '10%', right: '10%' },
    { icon: <Dumbbell size={160} />, className: 'animate-float', bottom: '20%', left: '10%' },
    { icon: <Zap size={140} />, className: 'animate-pulse-soft', top: '40%', left: '25%' },
    { icon: <Target size={180} />, className: 'animate-float', top: '60%', right: '20%' },
  ],
  doctor: [
    { icon: <Stethoscope size={220} />, className: 'animate-float', top: '15%', right: '15%' },
    { icon: <Activity size={180} />, className: 'animate-pulse-soft', top: '50%', left: '10%' },
    { icon: <Shield size={160} />, className: 'animate-float', bottom: '15%', left: '30%' },
    { icon: <Heart size={140} />, className: 'animate-pulse-soft', top: '10%', left: '20%' },
  ],
  cook: [
    { icon: <ChefHat size={220} />, className: 'animate-float', top: '10%', left: '15%' },
    { icon: <Utensils size={180} />, className: 'animate-float', bottom: '25%', right: '15%' },
    { icon: <ChefHat size={140} />, className: 'animate-float', top: '50%', right: '35%' },
    { icon: <Heart size={120} />, className: 'animate-pulse-soft', top: '20%', right: '10%' },
  ],
  admin: [
    { icon: <Shield size={200} />, className: 'animate-float', top: '15%', right: '10%' },
    { icon: <Activity size={180} />, className: 'animate-pulse-soft', top: '55%', left: '15%' },
    { icon: <Zap size={160} />, className: 'animate-float', bottom: '15%', right: '40%' },
    { icon: <Dumbbell size={140} />, className: 'animate-float', top: '10%', left: '10%' },
  ],
};


