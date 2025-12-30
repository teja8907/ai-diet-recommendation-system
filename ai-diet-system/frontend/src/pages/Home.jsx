import HomeHero from "../components/HomeHero";
import AIAssistant from "../components/AIAssistant";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      {/* HERO FULL SCREEN */}
      <section className="hero-screen">
        <div className="brand-center">
          <h1 className="brand-title">🍽️ Goodie-Foodie</h1>
          <p className="brand-tagline">Eat smart. Live healthy.</p>
        </div>

        <HomeHero />
      </section>

      {/* CONTENT BELOW HERO */}
      <section className="below-hero">
        <AIAssistant />
      </section>
    </div>
  );
}
