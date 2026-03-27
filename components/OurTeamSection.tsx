"use client";

import Image from "next/image";

export default function OurTeamSection() {
  const highlights = [
    { number: "01", label: "Years of Hands-On Experience" },
    { number: "02", label: "Real-World Case Experts" },
    { number: "03", label: "Condition-Specific Guidance" },
    { number: "04", label: "PCOD, Thyroid & Diabetes Experience" },
  ];

  const galleryImages = [
    "https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-69b7c6ffa14dfc9fbf5ad639.jpg",
    "https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-69b7c65ca14dfc9fbf5ad4c4.jpg",
    "https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-69b7c701a14dfc9fbf5ad644.jpg",
    "https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-69b7c707a14dfc9fbf5ad665.jpg",
  ];

  return (
    <>
      <section className="our-team-section">

        {/* Banner */}
        <div className="team-banner">
          <Image
            src="https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-69b7c6e9a14dfc9fbf5ad5a5.jpg"
            alt="Our Team"
            width={1920}
            height={1080}
            priority
            className="team-banner-image"
            sizes="100vw"
          />
        </div>

        {/* Content */}
        <div className="team-content-wrap">
          <div className="team-content-inner">

            <div className="team-heading-group">
              <div className="team-label-row">
               
                
              </div>
              <div className="flex items-center gap-2 mb-4">
              <span className="text-[#f5a623] text-lg">✦</span>
              <span className="text-teal-600 text-base font-semibold">
                Our Team
              </span>
            </div>

              <h2 className="team-title">
                The People Behind Your Weight Loss Journey
              </h2>
            </div>
<br></br>
            <div className="team-description">
              Weight loss doesn’t work because of a chart. It works because of people. DTPS is run by a team of {" "}
              <span className="bold">
                200+ dietitians and health counsellors.
              </span>
              <br />
              They talk to you, understand your routine and adjust your plan when things don’t go as planned. They track your progress, adjust your plan when needed, and stay involved until results show. This isn’t automated support. This isn’t passion written in a job description. It comes from people who genuinely care about outcomes, who think beyond charts and calls, and who take personal responsibility for your progress until results actually show.
            </div>

          </div>

          <div className="team-divider" />

          <div className="highlights-grid">
            {highlights.map((item) => (
              <div key={item.number} className="highlight-card">
                <div className="highlight-number-box">
                  <div className="highlight-number">{item.number}</div>
                </div>
                <div className="highlight-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="team-gallery">
          {galleryImages.map((img, index) => (
            <div key={index} className="gallery-card">
              <Image
                src={img}
                alt={`Gallery ${index + 1}`}
                fill
                className="gallery-image"
                sizes="(max-width: 767px) 80vw, 25vw"
              />
            </div>
          ))}
        </div>

      </section>

<style jsx>{`

.our-team-section {
  width: 100%;
  max-width: 1200px;
  background: white;
  overflow: hidden;
  border-radius: 25.9px;
  outline: 0.5px solid #6c6c6c;
  outline-offset: -0.5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding-bottom: 40px;
  margin-top: 40px;
  margin-left: auto;
  margin-right: auto;
}

/* BANNER */

.team-banner {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.team-banner-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  object-position: center;
}

/* CONTENT */

.team-content-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 33px;
  width: 100%;
  max-width: 1200px;
  padding: 0 8px;
}

.team-content-inner {
  width: 100%;
  max-width: 920px;
}

.team-heading-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.team-label-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.team-label-icon {
  width: 14px;
  height: 14px;
  background: #ff850b;
}

.team-label-text {
  color: #014e4e;
  font-size: 14px;
  font-weight: 600;
}

.team-title {
  margin: 0;
  color: #1e1e1e;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.12;
  text-align: center;
}

.team-description {
  width: 100%;
  font-size: 16px;
  line-height: 26px;
}

.team-description .bold {
  font-weight: 700;
}

.team-divider {
  width: 458px;
  border-top: 2px solid #e9e9e9;
}

/* HIGHLIGHTS DESKTOP */

.highlights-grid {
  width: 100%;
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
}

.highlight-card {
  width: calc(50% - 11px);
  min-height: 76px;
  padding: 8px;
  background: white;
  box-shadow: 0 0 4px rgba(0,0,0,0.25);
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.highlight-number-box {
  width: 60px;
  height: 60px;
  background: #014e4e;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.highlight-number {
  color: white;
  font-size: 24px;
  font-weight: 800;
}

.highlight-label {
  font-size: 18px;
  font-weight: 600;
}

/* GALLERY DESKTOP */

.team-gallery {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  padding: 0 8px;
}

.gallery-card {
  width: 100%;
  height: 179px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}

.gallery-image {
  object-fit: cover;
}

@media (min-width:768px) {
.team-content-wrap,
.team-gallery {
  padding-left: 16px;
  padding-right: 16px;
}
}

@media (min-width:1024px) {
.team-content-wrap,
.team-gallery {
  padding-left: 24px;
  padding-right: 24px;
}
}

/* TABLET */

@media (max-width:1024px) {
.gallery-card {
  height: 170px;
}

.team-gallery {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

}

/* MOBILE */

@media (max-width:767px) {

/* FIX SIDE GAP */
.our-team-section{
  border-radius:16px;
  margin-left:auto;
  margin-right:auto;
  width:100%;
  max-width: 1200px;
  padding-bottom: 32px;
}

.team-content-wrap,
.team-gallery{
  padding-left:8px;
  padding-right:8px;
}

/* TEXT */
.team-title{
  font-size:28px;
}

/* HIGHLIGHTS GRID */

.highlights-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
}

.highlight-card{
  width:100%;
  min-height:130px;
  border-radius:22px;
  padding:16px;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  text-align:center;
}

.highlight-number-box{
  width:56px;
  height:56px;
  border-radius:14px;
}

.highlight-number{
  font-size:22px;
}

.highlight-label{
  font-size:15px;
  margin-top:8px;
}

/* MOBILE GALLERY */

.team-gallery{
  flex-wrap:nowrap;
  display:flex;
  overflow-x:auto;
  scroll-snap-type:x mandatory;
  gap:14px;
  padding:0 8px;
}

.gallery-card{
  flex:0 0 80%;
  height:160px;
  scroll-snap-align:center;
}

.team-gallery::-webkit-scrollbar{
  display:none;
}

}

`}</style>
    </>
  );
}