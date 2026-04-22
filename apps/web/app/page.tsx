export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        gap: '16px',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--color-safe)',
        }}
      >
        Dart Finance
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
        Investor-aware safe-to-spend — coming soon
      </p>
    </main>
  );
}
