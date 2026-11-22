import Icon from "./Icon.jsx";

export default function SiteFooter() {
  return (
    <footer className="page-footer">
      <span>Thoughtful applications start with a little clarity.</span>
      <span className="footer-lock"><Icon name="lock" size={14} /> Private by design</span>
    </footer>
  );
}
