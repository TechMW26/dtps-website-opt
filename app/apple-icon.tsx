import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#014E4E',
          color: '#FFFFFF',
          fontSize: 92,
          fontWeight: 800,
          borderRadius: 32,
          border: '10px solid #FF8A1F',
          letterSpacing: '-0.06em',
        }}
      >
        DP
      </div>
    ),
    size
  );
}