import logoImg from "@/assets/logo/logo-icon.png";

export default function Logo() {
  return (
    <div className="logo">
      <span className="mark">
        <img src={logoImg} alt="Cinwaan logo" />
      </span>
      Cinwaan
    </div>
  );
}