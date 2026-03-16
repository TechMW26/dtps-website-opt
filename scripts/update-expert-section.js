const fs = require('fs');
const file = './app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find and replace the Expert Guidance section
const startMarker = '{/* Expert Guidance Section */}';
const endMarker = '{/* Our Video Section */}';
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

console.log('Start index:', startIdx, 'End index:', endIdx);

if (startIdx >= 0 && endIdx > startIdx) {
  const newSection = `{/* Expert Guidance Section */}
      <section className="expert-guidance-section" style={{ background: '#fff', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#ff9100', fontSize: '1.2rem' }}>✦</span>
              <span style={{ color: '#009688', fontWeight: 600, fontSize: '1rem' }}>Expert Guidance</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#222', lineHeight: 1.2 }}>
              You are under Expert&apos;s Guidance
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              Meet our award Winning Dietitian
            </p>
          </div>
          
          {/* Expert Content */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Left - Vertical SAGAR Text */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              {'SAGAR'.split('').map((letter, i) => (
                <span key={i} style={{ 
                  fontWeight: 800, 
                  fontSize: '2.5rem', 
                  color: '#0b4c4c',
                  lineHeight: 1,
                  letterSpacing: '2px'
                }}>{letter}</span>
              ))}
            </div>
            
            {/* Center - Image with decoration */}
            <div style={{ position: 'relative' }}>
              <Image
                src="/api/images/69b7c66fa14dfc9fbf5ad4fc"
                alt="Dietitian Poonam Sagar"
                width={320}
                height={400}
                style={{ borderRadius: '20px', objectFit: 'cover' }}
              />
              {/* Decorative circles */}
              <div style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                width: '60px',
                height: '60px',
                border: '2px dashed #009688',
                borderRadius: '50%',
                animation: 'spin 10s linear infinite'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                left: '-10px',
                width: '40px',
                height: '40px',
                background: '#ff9100',
                borderRadius: '50%',
                opacity: 0.8
              }} />
            </div>
            
            {/* Right - Description Card */}
            <div style={{ 
              maxWidth: '400px', 
              background: '#0b4c4c', 
              borderRadius: '20px', 
              padding: '2rem',
              color: '#fff',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute',
                top: '-20px',
                left: '20px',
                background: '#ff9100',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem'
              }}>
                25+ Years Experience
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
                Dt. Poonam Sagar
              </h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem' }}>
                Award Winning Dietitian
              </p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.95 }}>
                Dt. Poonam Sagar has 25+ years dietary and clinical expertise. That&apos;s why we are trusted by 15,000+ clients for their health and nutrition goals. Her approach is rooted in evidence-based nutrition, personalized care, and a passion for helping people achieve lasting results.
              </p>
              {/* Stats */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ff9100' }}>15K+</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Happy Clients</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ff9100' }}>25+</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      `;
  
  const newContent = content.substring(0, startIdx) + newSection + content.substring(endIdx);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('File updated successfully');
} else {
  console.log('Markers not found');
}
