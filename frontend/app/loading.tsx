export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-8">
                {/* Spinner with gradient border */}
                <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-linear-to-r from-primary via-accent to-secondary opacity-75 blur-sm animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-background" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-accent animate-spin" />
                </div>

                {/* Loading Text */}
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                        Loading...
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Please wait while we prepare your content
                    </p>
                </div>

                {/* Animated Dots */}
                <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
            </div>
        </div>
    );
}
