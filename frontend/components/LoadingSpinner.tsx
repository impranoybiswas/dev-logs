

export default function LoadingSpinner({className}: {className?: string}) {
  return (
    <div className={`size-16 relative bg-transparent rounded-full overflow-hidden flex items-center justify-center ${className}`}>
        <div className="absolute top-0 left-0 size-full bg-linear-to-r from-primary via-transparent to-transparent animate-spin"/>
        <div className="size-14 bg-background rounded-full z-50 relative">
        </div>
    </div>
  )
}
