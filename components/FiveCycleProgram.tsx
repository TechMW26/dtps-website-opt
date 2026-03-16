"use client";

/* ═══════════════════════════════════════════════
   SVG ICON COMPONENTS — matching screenshot exactly
   ═══════════════════════════════════════════════ */

/* Detox: circular recycling arrows with "DETOX" text */
function DetoxIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.5 18.5C33.1 13.3 28.5 9.5 23 9.5c-4.2 0-7.9 2.3-10 5.7l-2-1.2c2.5-4 7-6.5 12-6.5 6.6 0 12.2 4.3 14 10.3l3-1.3-2 7-6.5-3.5 3-1z" fill="white"/>
      <path d="M13.5 29.5c1.4 5.2 6 9 11.5 9 4.2 0 7.9-2.3 10-5.7l2 1.2c-2.5 4-7 6.5-12 6.5-6.6 0-12.2-4.3-14-10.3l-3 1.3 2-7 6.5 3.5-3 1z" fill="white"/>
      <text x="24" y="25.5" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="6.5" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="0.3">DETOX</text>
    </svg>
  );
}

/* Anti-Inflammatory: flame icon */
function FlameIcon() {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3c0 0-12 13-12 21a12 12 0 0024 0C31 16 19 3 19 3z" fill="white"/>
      <path d="M19 15c0 0-5 5.5-5 9a5 5 0 0010 0c0-3.5-5-9-5-9z" fill="#FF850B"/>
    </svg>
  );
}

/* Fat Burning: body silhouette with flames */
function FatBurnIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* torso */}
      <path d="M15 14c0 0 2-3 7-3s7 3 7 3v8c0 0-1 3-3 4l1 11h-10l1-11c-2-1-3-4-3-4V14z" fill="white"/>
      {/* head */}
      <circle cx="22" cy="8" r="4.5" fill="white"/>
      {/* left flame */}
      <path d="M8 22c0 0-4 4-4 7a4 4 0 008 0c0-3-4-7-4-7z" fill="white" opacity="0.85"/>
      <path d="M8 26c0 0-1.5 2-1.5 3a1.5 1.5 0 003 0c0-1-1.5-3-1.5-3z" fill="#FF850B"/>
      {/* right flame */}
      <path d="M36 22c0 0-4 4-4 7a4 4 0 008 0c0-3-4-7-4-7z" fill="white" opacity="0.85"/>
      <path d="M36 26c0 0-1.5 2-1.5 3a1.5 1.5 0 003 0c0-1-1.5-3-1.5-3z" fill="#FF850B"/>
    </svg>
  );
}

/* Metabolic Booster: atom/molecule */
function MetabolicIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="3.5" fill="white"/>
      <ellipse cx="20" cy="20" rx="15" ry="5.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <ellipse cx="20" cy="20" rx="15" ry="5.5" stroke="white" strokeWidth="1.8" fill="none" transform="rotate(60 20 20)"/>
      <ellipse cx="20" cy="20" rx="15" ry="5.5" stroke="white" strokeWidth="1.8" fill="none" transform="rotate(-60 20 20)"/>
      <circle cx="35" cy="20" r="2" fill="white"/>
      <circle cx="12.5" cy="7" r="2" fill="white"/>
      <circle cx="12.5" cy="33" r="2" fill="white"/>
    </svg>
  );
}

/* Maintenance: body silhouette with measurement arrows */
function MaintenanceIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <path d="M22 4a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" fill="white"/>
      <path d="M16 15h12c1 0 2 1 2 2l-1 8-2 1-1.5 12h-7L17 26l-2-1-1-8c0-1 1-2 2-2z" fill="white"/>
      {/* arrows */}
      <path d="M6 22h6M32 22h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 22l2.5-2v4L6 22z" fill="white"/>
      <path d="M38 22l-2.5-2v4L38 22z" fill="white"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   MOBILE DATA
   ═══════════════════════════════════════════════ */
const mobileItems = [
  { key: 'detox', icon: <DetoxIcon />, title: 'Detoxification', desc: 'This initial phase gently cleanses your body' },
  { key: 'anti', icon: <FlameIcon />, title: 'Anti-Inflammatory Detox', desc: 'Anti-inflammatory foods to reduce inflammation' },
  { key: 'fat', icon: <FatBurnIcon />, title: 'Fat Burning', desc: 'With a dynamic cycle focused on maximizing fat burning' },
  { key: 'meta', icon: <MetabolicIcon />, title: 'Metabolic Booster', desc: 'Rev up your metabolism with our metabolic booster cycle' },
  { key: 'maint', icon: <MaintenanceIcon />, title: 'Maintenance & Progression', desc: 'Celebrate your success and maintain your weight loss' },
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
export default function FiveCycleProgram() {
  return (
    <section className="fcp-section">
      {/* ── HEADER ── */}
      <div className="fcp-header">
        <h2 className="fcp-title">Our Five-Cycle Program</h2>
        <p className="fcp-subtitle">A science-based process that prepares your body for<br className="fcp-br-mobile" /> sustainable weight loss.</p>
      </div>

      {/* ═══ DESKTOP CIRCLE LAYOUT ═══ */}
      <div className="fcp-desktop">
        {/* Scalable wrapper — positions match the provided HTML exactly */}
        <div className="fcp-canvas">

          {/* Dashed border circle: 315.74 x 315.74 at (295.63, 111.13) within 902 x 447.84 */}
          <div className="fcp-dashed-circle" />

          {/* ── Center text ── */}
          <div className="fcp-center-label">HEALTHY<br/>WEIGHT LOSS</div>

          {/* ── ICON 1: Detoxification (top center) ── */}
          <div className="fcp-icon fcp-icon-detox"><div className="fcp-icon-inner"><DetoxIcon /></div></div>

          {/* ── ICON 2: Anti-Inflammatory Detox (top-right) ── */}
          <div className="fcp-icon fcp-icon-anti"><div className="fcp-icon-inner"><FlameIcon /></div></div>

          {/* ── ICON 3: Fat Burning (bottom-right) ── */}
          <div className="fcp-icon fcp-icon-fat"><div className="fcp-icon-inner"><FatBurnIcon /></div></div>

          {/* ── ICON 4: Metabolic Booster (bottom-left) ── */}
          <div className="fcp-icon fcp-icon-meta"><div className="fcp-icon-inner"><MetabolicIcon /></div></div>

          {/* ── ICON 5: Maintenance (top-left) ── */}
          <div className="fcp-icon fcp-icon-maint"><div className="fcp-icon-inner"><MaintenanceIcon /></div></div>

          {/* ── TEXT LABELS ── */}
          <div className="fcp-txt fcp-txt-detox">
            <div className="fcp-txt-title">Detoxification</div>
            <div className="fcp-txt-desc">This initial phase gently<br/>cleanses your body</div>
          </div>

          <div className="fcp-txt fcp-txt-anti">
            <div className="fcp-txt-title">Anti-Inflammatory<br/>Detox</div>
            <div className="fcp-txt-desc">Anti-inflammatory foods<br/>to reduce inflammation</div>
          </div>

          <div className="fcp-txt fcp-txt-fat">
            <div className="fcp-txt-title">Fat Burning</div>
            <div className="fcp-txt-desc">With a dynamic cycle focused<br/>on maximizing fat burning</div>
          </div>

          <div className="fcp-txt fcp-txt-meta">
            <div className="fcp-txt-title">Metabolic Booster</div>
            <div className="fcp-txt-desc">Rev up your metabolism with<br/>our metabolic booster cycle</div>
          </div>

          <div className="fcp-txt fcp-txt-maint">
            <div className="fcp-txt-title">Maintenance and<br/>Progression</div>
            <div className="fcp-txt-desc">Celebrate your success and<br/>maintain your weight loss</div>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE LIST LAYOUT ═══ */}
      <div className="fcp-mobile">
        {mobileItems.map((item) => (
          <div key={item.key} className="fcp-mob-card">
            <div className="fcp-mob-icon">{item.icon}</div>
            <div className="fcp-mob-text">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ STYLES ═══ */}
      <style jsx>{`
        /* ── Section ── */
        .fcp-section {
          background: #014E4E;
          border-radius: 24px;
          padding: 32px 16px 40px;
          color: #fff;
          overflow: hidden;
        }

        /* ── Header ── */
        .fcp-header {
          text-align: center;
          max-width: 640px;
          margin: 0 auto 0;
        }
        .fcp-title {
          font-size: 24px;
          font-weight: 700;
          color: #FBFBFB;
          line-height: 1.1;
          margin: 0 0 6px;
          font-family: 'Epilogue', sans-serif;
        }
        .fcp-subtitle {
          color: #FF850B;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.4;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }
        .fcp-br-mobile { display: inline; }

        /* ── Desktop: hidden on mobile ── */
        .fcp-desktop { display: none; }

        /* ── Mobile list ── */
        .fcp-mobile {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
        }
        .fcp-mob-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 14px;
        }
        .fcp-mob-icon {
          flex-shrink: 0;
          width: 54px;
          height: 54px;
          background: #FF850B;
          border-radius: 50%;
          border: 2.5px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fcp-mob-icon :global(svg) {
          width: 28px;
          height: 28px;
        }
        .fcp-mob-text {
          flex: 1;
          min-width: 0;
        }
        .fcp-mob-text h3 {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 3px;
          font-family: 'Epilogue', sans-serif;
        }
        .fcp-mob-text p {
          font-size: 13px;
          color: rgba(255,255,255,0.85);
          line-height: 1.35;
          margin: 0;
          font-family: 'Epilogue', sans-serif;
        }

        /* ── Small mobile ── */
        @media (max-width: 380px) {
          .fcp-section { padding: 24px 10px 30px; border-radius: 18px; }
          .fcp-title { font-size: 22px; }
          .fcp-subtitle { font-size: 13px; }
          .fcp-mob-card { padding: 12px; gap: 10px; }
          .fcp-mob-icon { width: 46px; height: 46px; }
          .fcp-mob-icon :global(svg) { width: 24px; height: 24px; }
          .fcp-mob-text h3 { font-size: 14px; }
          .fcp-mob-text p { font-size: 12px; }
        }

        /* ════════════════════════════════════════════
           DESKTOP  ≥ 769px
           All positions are % of the 902×448 canvas
           from the reference HTML
        ════════════════════════════════════════════ */
        @media (min-width: 769px) {
          .fcp-section { padding: 32px 20px 40px; }
          .fcp-title { font-size: 40px; line-height: 36px; }
          .fcp-subtitle { font-size: 24px; }
          .fcp-br-mobile { display: none; }

          .fcp-mobile { display: none; }
          .fcp-desktop { display: block; }

          /* Scalable canvas – uses aspect ratio so positions scale */
          .fcp-canvas {
            position: relative;
            width: 100%;
            max-width: 902px;
            margin: 30px auto 0;
            /* aspect ratio 902 / 448 */
            padding-bottom: 49.67%;
          }

          /* ── Dashed circle ── */
          .fcp-dashed-circle {
            position: absolute;
            /* 295.63/902=32.78%, 111.13/447.84=24.81% */
            left: 32.78%;
            top: 24.81%;
            /* 315.74/902=35.00%, 315.74/447.84=70.51% */
            width: 35.00%;
            height: 70.51%;
            border-radius: 50%;
            border: 2.16px dashed rgba(255,255,255,0.55);
          }

          /* ── Center text ── */
          .fcp-center-label {
            position: absolute;
            /* 371.16/902=41.15%, 242.76/447.84=54.21% */
            left: 41.15%;
            top: 54.21%;
            text-align: center;
            color: white;
            font-size: clamp(18px, 2.87vw, 25.89px);
            font-family: 'Epilogue', sans-serif;
            font-weight: 600;
            text-transform: capitalize;
            line-height: 1.15;
          }

          /* ── Icon circles ── */
          .fcp-icon {
            position: absolute;
            /* 86.40/902=9.58%, 86.40/447.84=19.29% */
            width: 9.58%;
            height: 0;
            padding-bottom: 9.58%;
          }
          .fcp-icon-inner {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: #FF850B;
            border: 3.24px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .fcp-icon-inner :global(svg) {
            width: 55%;
            height: 55%;
          }

          /* Icon positions (left/top as % of 902×448) */
          .fcp-icon-detox { left: 45.51%; top: 17.35%; }
          .fcp-icon-anti  { left: 62.07%; top: 41.68%; }
          .fcp-icon-fat   { left: 55.75%; top: 80.71%; }
          .fcp-icon-meta  { left: 35.27%; top: 80.71%; }
          .fcp-icon-maint { left: 28.95%; top: 41.68%; }

          /* ── Text labels ── */
          .fcp-txt {
            position: absolute;
          }
          .fcp-txt-title {
            color: white;
            font-size: clamp(16px, 2.87vw, 25.89px);
            font-family: 'Epilogue', sans-serif;
            font-weight: 600;
            text-transform: capitalize;
            line-height: 1.05;
            margin-bottom: 6px;
          }
          .fcp-txt-desc {
            color: white;
            font-size: clamp(12px, 1.91vw, 17.26px);
            font-family: 'Epilogue', sans-serif;
            font-weight: 400;
            line-height: 1.15;
          }

          /* Detoxification – top center: left:346.34/902=38.40%, top:0 */
          .fcp-txt-detox {
            left: 38.40%;
            top: 0%;
            width: 23.92%; /* 215.79/902 */
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Anti-Inflammatory – right side: left:663.55/902=73.56%, top:183.42/447.84=40.96% */
          .fcp-txt-anti {
            left: 73.56%;
            top: 40.96%;
            text-align: left;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          .fcp-txt-anti .fcp-txt-desc { width: clamp(140px, 23.21vw, 209.32px); }

          /* Fat Burning – bottom right: left:607.45/902=67.35%, top:369/447.84=82.39% */
          .fcp-txt-fat {
            left: 67.35%;
            top: 82.39%;
            text-align: left;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          /* Metabolic Booster – bottom left: left:57.18/902=6.34%, top:369/447.84=82.39% */
          .fcp-txt-meta {
            left: 6.34%;
            top: 82.39%;
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .fcp-txt-meta .fcp-txt-desc { width: clamp(150px, 26.79vw, 241.68px); }

          /* Maintenance – left side: left:0, top:183.42/447.84=40.96% */
          .fcp-txt-maint {
            left: 0%;
            top: 40.96%;
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .fcp-txt-maint .fcp-txt-desc { width: clamp(150px, 27.03vw, 243.84px); }
          .fcp-txt-maint .fcp-txt-title { line-height: 1.05; }
          .fcp-txt-anti .fcp-txt-title { line-height: 1.05; }
        }

        /* ── Larger desktop ≥ 1100px: fixed canvas ── */
        @media (min-width: 1100px) {
          .fcp-canvas {
            max-width: 902px;
            padding-bottom: 448px;
          }
          .fcp-center-label { font-size: 25.89px; }
          .fcp-txt-title { font-size: 25.89px; }
          .fcp-txt-desc { font-size: 17.26px; }
        }
      `}</style>
    </section>
  );
}
