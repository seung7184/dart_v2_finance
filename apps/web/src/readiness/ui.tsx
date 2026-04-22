import { Badge, Button, Card } from '@dart/ui';
import { getPhase3Readiness, type ReadinessItem, type ReadinessStatus } from './phase3';

function getBadgeVariant(status: ReadinessStatus) {
  if (status === 'configured') {
    return 'protected';
  }

  if (status === 'pending_secret') {
    return 'warning';
  }

  return 'transfer';
}

function getStatusLabel(status: ReadinessStatus) {
  if (status === 'configured') {
    return 'Configured';
  }

  if (status === 'pending_secret') {
    return 'Pending secret';
  }

  return 'Scaffolded';
}

function getCategoryLabel(item: ReadinessItem) {
  if (item.category === 'auth') {
    return 'Auth';
  }

  if (item.category === 'observability') {
    return 'Observability';
  }

  if (item.category === 'beta_ops') {
    return 'Beta ops';
  }

  return 'Billing';
}

export function ReadinessSummary() {
  const items = getPhase3Readiness(process.env);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {items.map((item) => (
        <Card key={item.id} style={{ display: 'grid', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'grid', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge variant={getBadgeVariant(item.status)}>{getStatusLabel(item.status)}</Badge>
                <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
                  {getCategoryLabel(item)}
                </span>
              </div>
              <h2 style={{ fontSize: 'var(--text-xl)' }}>{item.title}</h2>
            </div>

            <a href={item.href} style={{ textDecoration: 'none' }}>
              <Button type="button" variant="secondary">
                Open page
              </Button>
            </a>
          </div>

          <p style={{ color: 'var(--color-text-muted)' }}>{item.summary}</p>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            Next step: {item.nextStep}
          </p>
        </Card>
      ))}
    </div>
  );
}
