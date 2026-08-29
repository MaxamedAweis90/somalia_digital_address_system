import sdasLogo from "@/assets/logo/sdas_logo.png";

/**
 * SDAS Logo
 * Reusable brand mark — used on Login and anywhere else the wordmark is needed.
 *
 * Props:
 *  - className: extra classes to control size/spacing from the parent
 */
export default function Logo({ className = "h-16 sm:h-20 w-auto" }) {
  return (
    <img
      src={sdasLogo}
      alt="SDAS - Somali Digital Address System"
      className={`${className} object-contain`}
    />
  );
}