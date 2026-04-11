"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-container selection:bg-primary/20 bg-background ">
      <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto  flex items-center justify-center bg-linear-to-br from-background via-background to-muted min-h-dvh">
        <div className="max-w-2xl w-full text-center">
          {/* Animated 404 Number */}
          <div className="relative mb-8">
            <h1 className="text-[150px] md:text-[200px] font-bold bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-none animate-pulse">
              404
            </h1>
            <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-accent/20 to-secondary/20 blur-3xl -z-10" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Oops! The page you&apos;re looking for seems to have wandered off
              into the digital void. Let&apos;s get you back on track.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link
                href="/"
                className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Back to Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="px-8 py-3 rounded-lg bg-muted hover:bg-muted-foreground/20 text-foreground font-medium transition-all duration-200"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-16 flex justify-center gap-3">
            <div
              className="w-3 h-3 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-3 h-3 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-3 h-3 rounded-full bg-secondary animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
