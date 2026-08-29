import logoImg from "@/assets/logo/logo-icon.png";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="flogo">
        <span className="mark">
          <img src={logoImg} alt="Cinwaan logo" />
        </span>
        Cinwaan
      </div>
      <span>© 2026 Cinwaan Technologies · Mogadishu, Somalia</span>
    </footer>
  );
}
