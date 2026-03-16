const fs = require('fs');
const file = './app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find and replace the FAQ section
const startMarker = '{/* FAQ Section */}';
const endMarker = '{/* Testimonials Section */}';
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

console.log('Start index:', startIdx, 'End index:', endIdx);

if (startIdx >= 0 && endIdx > startIdx) {
  const newSection = `{/* FAQ Section */}
      <FAQSection />

      `;
  
  const newContent = content.substring(0, startIdx) + newSection + content.substring(endIdx);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('File updated successfully');
} else {
  console.log('Markers not found');
}
