export default function LoadingSpinner({ text = 'Analiz yapılıyor...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#e94560] border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  )
}
