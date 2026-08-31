import Logo from "@/components/Logo";

export default function LoadingState({
  message = "Somalia Digital Address System",
  submessage = "Loading portal resources...",
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 select-none">
      <div className="flex flex-col items-center max-w-xs w-full text-center">
        {/* SDAS Brand Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-3 rounded-full bg-blue/10 blur-md animate-pulse" />
          <Logo className="relative h-16 sm:h-20 w-auto object-contain transition-transform duration-300 hover:scale-105" />
        </div>

        {/* System Title & Submessage */}
        <h2 className="text-[15px] font-semibold tracking-tight text-ink font-display">
          {message}
        </h2>
        {submessage && (
          <p className="mt-1 text-[12px] text-ink-soft">
            {submessage}
          </p>
        )}

        {/* Animated Progress Bar */}
        <div className="mt-5 w-48 sm:w-56 h-1.5 bg-line rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute inset-y-0 bg-gradient-to-r from-brand via-blue to-teal rounded-full animate-progress-slide" />
        </div>
      </div>
    </div>
  );
}
