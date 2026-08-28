import logoImg from "/logo.png";

export default function Logo({ variant = "dark" }) {
  return (
    <div className="logo">
      <span className="mark">
        <img src={logoImg} alt="Cinwaan logo" />
      </span>
      Cinwaan
    </div>
  );
}