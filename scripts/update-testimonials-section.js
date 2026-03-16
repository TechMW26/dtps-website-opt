const fs = require('fs');
const file = './app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find and replace the Testimonials section
const startMarker = '{/* Testimonials Section */}';
const endMarker = '    </>\n  );\n}';
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

console.log('Start index:', startIdx, 'End index:', endIdx);

if (startIdx >= 0 && endIdx > startIdx) {
  const newSection = `{/* Testimonials Section */}
      <section style={{ background: '#fff', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#ff9100', fontSize: '1.2rem' }}>✦</span>
              <span style={{ color: '#009688', fontWeight: 600, fontSize: '1rem' }}>Our Testimonials</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#222', lineHeight: 1.2 }}>
              Success stories from our clients
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Left - Testimonial Cards */}
            <div style={{ flex: '1', minWidth: '400px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {testimonials.slice(0, 4).map((testimonial, index) => (
                  <div 
                    key={testimonial._id || index}
                    style={{ 
                      background: index === 1 ? '#ff9100' : '#fff', 
                      borderRadius: '20px', 
                      padding: '1.5rem',
                      boxShadow: index === 1 ? '0 10px 30px rgba(255, 145, 0, 0.3)' : '0 5px 20px rgba(0,0,0,0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => { 
                      e.currentTarget.style.transform = 'translateY(-5px)'; 
                      e.currentTarget.style.boxShadow = index === 1 ? '0 15px 40px rgba(255, 145, 0, 0.4)' : '0 10px 30px rgba(0,0,0,0.12)';
                    }}
                    onMouseOut={(e) => { 
                      e.currentTarget.style.transform = 'translateY(0)'; 
                      e.currentTarget.style.boxShadow = index === 1 ? '0 10px 30px rgba(255, 145, 0, 0.3)' : '0 5px 20px rgba(0,0,0,0.08)';
                    }}
                  >
                    <div style={{ 
                      color: index === 1 ? '#fff' : '#ff9100', 
                      marginBottom: '0.75rem',
                      fontSize: '1.1rem',
                      letterSpacing: '2px'
                    }}>★★★★★</div>
                    <p style={{ 
                      color: index === 1 ? '#fff' : '#555', 
                      fontSize: '0.95rem', 
                      lineHeight: 1.7, 
                      marginBottom: '1rem',
                      fontStyle: 'italic'
                    }}>
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: index === 1 ? '1px solid rgba(255,255,255,0.2)' : '1px solid #eee'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: index === 1 ? 'rgba(255,255,255,0.2)' : '#009688',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1rem'
                      }}>
                        {testimonial.name.charAt(0)}
                      </div>
                      <div style={{ fontWeight: 700, color: index === 1 ? '#fff' : '#222' }}>{testimonial.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right - Stats and Badge */}
            <div style={{ flex: '1', minWidth: '350px', position: 'relative', height: '450px' }}>
              {/* Main Stats Card */}
              <div style={{
                background: '#0b4c4c',
                borderRadius: '30px',
                padding: '3rem',
                color: '#fff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background decoration */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'rgba(255, 145, 0, 0.1)'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: 'rgba(0, 150, 136, 0.2)'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: '5rem', 
                    fontWeight: 800, 
                    lineHeight: 1,
                    marginBottom: '0.5rem'
                  }}>
                    15K<span style={{ color: '#ff9100' }}>+</span>
                  </div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600,
                    marginBottom: '1.5rem',
                    opacity: 0.9
                  }}>
                    Happy Clients
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    width: 'fit-content'
                  }}>
                    <span style={{ color: '#ff9100', fontSize: '1.5rem' }}>★</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>4.9</span>
                    <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>Average Rating</span>
                  </div>
                  
                  {/* Trust badges */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginTop: '2rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      background: '#ff9100',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      ✓ Verified Reviews
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.15)',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      ✓ 25+ Years Trust
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}`;
  
  const newContent = content.substring(0, startIdx) + newSection;
  // Keep the comment at the end if it exists
  const afterEndMarker = content.substring(endIdx + endMarker.length);
  if (afterEndMarker.trim().startsWith('//')) {
    // There's a comment, let's keep it
    const finalContent = newContent + '\n' + afterEndMarker.trim() + '\n';
    fs.writeFileSync(file, finalContent, 'utf8');
  } else {
    fs.writeFileSync(file, newContent + '\n', 'utf8');
  }
  console.log('File updated successfully');
} else {
  console.log('Markers not found');
}
