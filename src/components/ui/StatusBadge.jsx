const styles = {
  Active: 'bg-success-tint text-success-text',
  'In review': 'bg-warning-tint text-warning-text',
  Closed: 'bg-disabled-bg text-text-muted',
  New: 'bg-info-tint text-info-text',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-[10px] py-[3px] rounded-pill text-[11px] font-medium ${styles[status] || styles.Closed}`}>
      {status}
    </span>
  )
}