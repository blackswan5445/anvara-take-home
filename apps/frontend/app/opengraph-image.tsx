import { ImageResponse } from 'next/og';

export const alt = 'Anvara: the sponsorship marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 80,
        background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
        color: 'white',
      }}
    >
      <div style={{ fontSize: 36, opacity: 0.8 }}>Anvara</div>
      <div style={{ fontSize: 72, fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}>
        Sponsor the audiences your customers already trust.
      </div>
    </div>,
    size
  );
}
