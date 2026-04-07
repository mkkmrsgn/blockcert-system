import React from "react";
import { Link } from "react-router-dom";
import ThemeShell from "../components/ThemeShell";

import a1Logo from "../assets/driving-schools/a1-logo.jpg";
import smartLogo from "../assets/driving-schools/smart-logo.jpg";
import socialitesLogo from "../assets/driving-schools/socialites-logo.jpg";
import precisionLogo from "../assets/driving-schools/precision-logo.jpg";

const schools = [
  {
    name: "A-1 Driving Company",
    location: "Las Piñas / Metro Manila",
    website: "https://a-1driving.com/",
    map: "https://www.google.com/maps/search/?api=1&query=A-1+Driving+Las+Piñas",
    logo: a1Logo,
    note: "Official site lists multiple Metro Manila branches and a Las Piñas training center.",
  },
  {
    name: "Smart Driving School",
    location: "Bacoor, Cavite / Metro Manila",
    website: "https://www.smartdriving.com.ph/",
    map: "https://www.google.com/maps/search/?api=1&query=Smart+Driving+School+Bacoor+Cavite",
    logo: smartLogo,
    note: "Official announcements list Bacoor, Cavite among open branches.",
  },
  {
    name: "Socialites Driving School",
    location: "Metro Manila (Mayon, Fairview, Cubao, Caloocan)",
    website: "https://sites.google.com/view/socialitesdrivingschool/home",
    map: "https://www.google.com/maps/search/?api=1&query=Socialites+Driving+School+Mayon+Quezon+City",
    logo: socialitesLogo,
    note: "Official pages show multiple Metro Manila branches and LTO-accredited services.",
  },
  {
    name: "Precision Driving School",
    location: "Antipolo / nearby NCR-Rizal area",
    website: "https://precision-driving.com/",
    map: "https://www.google.com/maps/search/?api=1&query=Precision+Driving+School+Antipolo",
    logo: precisionLogo,
    note: "Official site and OTDC profile show Antipolo branch and LTO-accredited driving programs.",
  },
];

export default function DrivingSchoolsPage() {
  return (
    <ThemeShell
      title="Driving Schools"
      subtitle="LTO-accredited driving schools near Metro Manila and Bacoor, Cavite with website and map access."
      wide
    >
      <style>{`
        .schools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 22px;
          margin-top: 10px;
        }

        .school-card-theme {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          padding: 24px 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 26px rgba(0,0,0,0.18);
          transition: transform 0.25s ease, background 0.25s ease;
          text-align: center;
        }

        .school-card-theme:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,0.14);
        }

        .school-logo-wrap-theme {
          width: 120px;
          height: 120px;
          margin: 0 auto 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 10px;
        }

        .school-logo-theme {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #fff;
          border-radius: 12px;
        }

        .school-title-theme {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.04em;
          margin-bottom: 10px;
        }

        .school-actions-theme {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 18px;
        }

        .school-actions-theme a {
          text-decoration: none;
        }

        .school-actions-theme button {
          min-width: 140px;
        }
      `}</style>

      <div className="schools-grid">
        {schools.map((school, index) => (
          <div key={index} className="school-card-theme">
            <div className="school-logo-wrap-theme">
              <img
                src={school.logo}
                alt={`${school.name} logo`}
                className="school-logo-theme"
              />
            </div>

            <h3 className="school-title-theme">{school.name}</h3>
            <p><strong>Area:</strong> {school.location}</p>
            <p className="small">{school.note}</p>

            <div className="school-actions-theme">
              <a href={school.website} target="_blank" rel="noreferrer">
                <button type="button">Visit Website</button>
              </a>

              <a href={school.map} target="_blank" rel="noreferrer">
                <button type="button">Open Map</button>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="nav-links" style={{ marginBottom: "20px" }}>
        <Link to="/" className="btn">Back Home</Link>
      </div>

    </ThemeShell>
  );
}