const particles = [
  { left: "8%", top: "16%", size: 4, opacity: 0.42, delay: "0s", duration: "4.4s" },
  { left: "18%", top: "10%", size: 5, opacity: 0.3, delay: "0.8s", duration: "5.2s" },
  { left: "26%", top: "21%", size: 3, opacity: 0.36, delay: "1.2s", duration: "4.8s" },
  { left: "36%", top: "14%", size: 4, opacity: 0.28, delay: "0.4s", duration: "5.8s" },
  { left: "44%", top: "8%", size: 2, opacity: 0.34, delay: "1.6s", duration: "4.6s" },
  { left: "53%", top: "18%", size: 4, opacity: 0.26, delay: "0.7s", duration: "5.6s" },
  { left: "62%", top: "12%", size: 5, opacity: 0.38, delay: "1.1s", duration: "4.9s" },
  { left: "71%", top: "20%", size: 3, opacity: 0.32, delay: "1.9s", duration: "5.5s" },
  { left: "79%", top: "9%", size: 4, opacity: 0.24, delay: "0.5s", duration: "4.7s" },
  { left: "88%", top: "17%", size: 3, opacity: 0.36, delay: "1.4s", duration: "5.1s" },
  { left: "12%", top: "28%", size: 2, opacity: 0.22, delay: "2s", duration: "4.4s" },
  { left: "24%", top: "32%", size: 4, opacity: 0.2, delay: "0.3s", duration: "5.3s" },
  { left: "58%", top: "29%", size: 2, opacity: 0.24, delay: "1.8s", duration: "4.5s" },
  { left: "82%", top: "30%", size: 4, opacity: 0.18, delay: "0.9s", duration: "5.7s" },
] as const

export function HeroParticles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-6 z-0 h-[23rem] overflow-hidden [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]"
    >
      {particles.map((particle, index) => (
        <span
          key={`${particle.left}-${particle.top}-${index}`}
          className="absolute rounded-full bg-primary shadow-[0_0_24px_rgba(88,149,145,0.45)] motion-safe:animate-pulse"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  )
}
