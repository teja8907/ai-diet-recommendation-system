import HomeHero from "../components/HomeHero";
import AIAssistant from "../components/AIAssistant";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero-screen">
        <div className="floating-food">
          <span>🥑</span>
          <span>🍎</span>
          <span>🥦</span>
          <span>🍓</span>
          <span>🥕</span>
        </div>

        <div className="brand-center">
          <h1 className="brand-title">🍽️ Goodie-Foodie</h1>
          <p className="brand-tagline">
            Eat smart. Live healthy.
          </p>
        </div>

        {/* ✅ ALL BUTTONS LIVE HERE */}
        <HomeHero />
      </section>

      {/* BELOW HERO */}
      <section className="below-hero">
        <AIAssistant />
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2025 <strong>Goodie-Foodie</strong></p>
        <p>Eat Smart. Live Healthy.</p>
        <p>Made with ❤️ for healthy living</p>
      </footer>
    </div>
  );
}
