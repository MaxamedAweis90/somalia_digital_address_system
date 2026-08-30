import { useEffect, useRef } from "react";

export default function RecaptchaWidget({ siteKey, onChange }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!siteKey) return undefined;

    const renderWidget = () => {
      if (!containerRef.current || !window.grecaptcha || widgetIdRef.current != null) {
        return;
      }

      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onChange?.(token),
        "expired-callback": () => onChange?.(null),
        "error-callback": () => onChange?.(null),
      });
    };

    if (window.grecaptcha) {
      window.grecaptcha.ready(renderWidget);
      return undefined;
    }

    const existingScript = document.querySelector('script[src*="google.com/recaptcha/api.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => window.grecaptcha?.ready(renderWidget));
      return undefined;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => window.grecaptcha?.ready(renderWidget);
    document.body.appendChild(script);

    return () => {
      widgetIdRef.current = null;
    };
  }, [siteKey, onChange]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}
