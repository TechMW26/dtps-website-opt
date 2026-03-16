const fs = require('fs');
const file = './app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find and replace the Our Video section
const startMarker = '{/* Our Video Section */}';
const endMarker = '{/* Our Programs Section */}';
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

console.log('Start index:', startIdx, 'End index:', endIdx);

if (startIdx >= 0 && endIdx > startIdx) {
  const newSection = `{/* Our Video Section */}
      <section style={{ 
        background: 'url("/api/images/69b7c744a14dfc9fbf5ad78c")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '5rem 2rem',
        position: 'relative',
        minHeight: '600px'
      }}>
        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(11, 76, 76, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)'
        }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem' }}>
            {/* Left content */}
            <div style={{ maxWidth: '500px', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ color: '#ff9100', fontSize: '1.2rem' }}>✦</span>
                <span style={{ color: '#ff9100', fontWeight: 600, fontSize: '1rem' }}>Our Video</span>
              </div>
              <h2 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem' }}>
                Lives through wellness<br />video stories
              </h2>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem', opacity: 0.9 }}>
                Explore inspiring stories of transformation and growth through our wellness videos, showcasing real journeys toward healthier, happier lives.
              </p>
              <button style={{ 
                background: '#ff9100', 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: '1rem', 
                border: 'none', 
                borderRadius: '2rem', 
                padding: '1rem 2.5rem', 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(255, 145, 0, 0.4)'
              }}>
                Explore More
              </button>
            </div>
            
            {/* Right - Play button with rotating text */}
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              {/* Center play button */}
              <div style={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px', 
                height: '80px', 
                background: '#ff9100', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 30px rgba(255,145,0,0.5)',
                zIndex: 2
              }}>
                <div style={{ 
                  width: 0, 
                  height: 0, 
                  borderLeft: '22px solid #fff', 
                  borderTop: '14px solid transparent', 
                  borderBottom: '14px solid transparent',
                  marginLeft: '6px'
                }} />
              </div>
              
              {/* Rotating circular text */}
              <svg style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '200px',
                height: '200px',
                animation: 'spin 15s linear infinite'
              }} viewBox="0 0 200 200">
                <defs>
                  <path id="circlePath" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
                </defs>
                <text fill="#fff" fontSize="12" fontWeight="500" letterSpacing="3">
                  <textPath href="#circlePath">
                    • WATCH VIDEO • TRANSFORMATION • SUCCESS STORIES • WELLNESS JOURNEY 
                  </textPath>
                </text>
              </svg>
              
              {/* Dashed circle border */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '170px',
                height: '170px',
                border: '2px dashed rgba(255,255,255,0.3)',
                borderRadius: '50%'
              }} />
            </div>
          </div>
          
          {/* Stats Bar */}
          <div style={{ 
            marginTop: '4rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap',
            gap: '2rem',
            padding: '2rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ textAlign: 'center', color: '#fff', flex: 1, minWidth: '150px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700 }}>25<span style={{ color: '#ff9100' }}>+</span></div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Year of experience</div>
            </div>
            <div style={{ textAlign: 'center', color: '#fff', flex: 1, minWidth: '150px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700 }}>260<span style={{ color: '#ff9100' }}>+</span></div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Hours of coaching</div>
            </div>
            <div style={{ textAlign: 'center', color: '#fff', flex: 1, minWidth: '150px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700 }}>550<span style={{ color: '#ff9100' }}>+</span></div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Complete courses</div>
            </div>
            <div style={{ textAlign: 'center', color: '#fff', flex: 1, minWidth: '150px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700 }}>20K<span style={{ color: '#ff9100' }}>+</span></div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Happy customer</div>
            </div>
            <div style={{ textAlign: 'center', color: '#fff', flex: 1, minWidth: '150px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700 }}>359<span style={{ color: '#ff9100' }}>+</span></div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Awards win</div>
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
