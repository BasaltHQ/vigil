import Link from 'next/link'

export default function PendingPage() {
  return (
    <div className="glass-panel p-8 rounded-2xl border-red-700/20 shadow-[0_0_30px_rgba(204,0,0,0.1)] backdrop-blur-xl bg-black/60 w-full max-w-md text-center">
      <div className="mb-6">
        <img src="/Vigil.png" alt="Vigil Shield" className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(204,0,0,0.4)] opacity-50" />
        <h1 className="text-2xl font-bold tracking-widest text-white mb-2 font-vox">ACCESS PENDING</h1>
        <p className="text-gray-400 text-sm tracking-wider">CONSTELLATION AUTHORIZATION REQUIRED</p>
      </div>

      <div className="p-4 border border-red-700/20 rounded-lg bg-red-950/10 mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs text-yellow-500/80 font-mono tracking-wider uppercase">Awaiting Approval</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          Your account has been registered and is awaiting administrator approval.
          You will be notified when access is granted to the Vigil Constellation.
        </p>
      </div>

      <div className="border-t border-white/10 pt-4">
        <Link href="/login" className="text-sm text-red-500 hover:text-white transition-colors tracking-wider">
          ← RETURN TO LOGIN
        </Link>
      </div>
    </div>
  )
}
