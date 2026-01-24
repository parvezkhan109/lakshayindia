export default function LuckIndiaLogo({ className = 'h-10 w-10' } = {}) {
  return (
    <img
      className={`${className} w-auto block object-contain select-none`}
      src="/logo.png"
      alt="LakshayIndia"
      decoding="async"
      loading="eager"
      draggable={false}
    />
  )
}
