export default function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-violet/30 bg-surface2/50 backdrop-blur-xl p-5 text-center">
      <div className="font-heading text-2xl md:text-3xl font-bold text-neon">{value}</div>
      <div className="mt-1 text-xs md:text-sm text-gray-400">{label}</div>
    </div>
  )
}
