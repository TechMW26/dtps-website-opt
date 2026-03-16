const fs = require('fs');
const file = './app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find and replace the Our Programs section
const startMarker = '{/* Our Programs Section */}';
const endMarker = '{/* How It Work Section */}';
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

console.log('Start index:', startIdx, 'End index:', endIdx);

if (startIdx >= 0 && endIdx > startIdx) {
  const newSection = `{/* Our Programs Section */}
      <section style={{ background: '#fff', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#ff9100', fontSize: '1.2rem' }}>✦</span>
                <span style={{ color: '#009688', fontWeight: 600, fontSize: '1rem' }}>Our Programs</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#222', lineHeight: 1.2 }}>
                Tailored programs for<br />your wellness
              </h2>
            </div>
            <button style={{ 
              background: '#ff9100', 
              color: '#fff', 
              fontWeight: 600, 
              fontSize: '1rem', 
              border: 'none', 
              borderRadius: '2rem', 
              padding: '0.8rem 2rem', 
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              All Programs
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Program Card 1 - Using Garima-Mam.jpeg */}
            <div style={{ 
              background: '#222', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              width: '360px', 
              height: '450px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <img src="/api/images/69b7c775a14dfc9fbf5ad844" alt="Weight Management Program" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                bottom: 0, 
                width: '100%', 
                padding: '1.5rem', 
                background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                color: '#fff'
              }}>
                <div style={{ 
                  display: 'inline-block', 
                  background: '#ff9100', 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>
                  WEIGHT LOSS
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Weight Management<br />Program</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Customized diet plans for effective and sustainable weight loss results.</p>
              </div>
            </div>
            
            {/* Program Card 2 - Using Shivani.jpeg */}
            <div style={{ 
              background: '#222', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              width: '360px', 
              height: '450px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <img src="/api/images/69b7c782a14dfc9fbf5ad882" alt="PCOD/PCOS Program" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                bottom: 0, 
                width: '100%', 
                padding: '1.5rem', 
                background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                color: '#fff'
              }}>
                <div style={{ 
                  display: 'inline-block', 
                  background: '#009688', 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>
                  PCOD/PCOS
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>PCOD/PCOS<br />Management</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Specialized nutrition programs for hormonal balance and PCOD management.</p>
              </div>
            </div>
            
            {/* Program Card 3 - Using Anshu-Jain.jpeg */}
            <div style={{ 
              background: '#222', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              width: '360px', 
              height: '450px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <img src="/api/images/69b7c768a14dfc9fbf5ad812" alt="Therapeutic Diet Program" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                bottom: 0, 
                width: '100%', 
                padding: '1.5rem', 
                background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                color: '#fff'
              }}>
                <div style={{ 
                  display: 'inline-block', 
                  background: '#0b4c4c', 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>
                  THERAPEUTIC
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Therapeutic Diet<br />Program</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Medical nutrition therapy for diabetes, thyroid, and other health conditions.</p>
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
