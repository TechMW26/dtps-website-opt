import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
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
          fontSize: 18,
          fontWeight: 800,
          borderRadius: 8,
          border: '2px solid #FF8A1F',
          letterSpacing: '-0.04em',
        }}
      >
        DP
      </div>
    ),
    size
  );
}