const STATUS_COLORS = {
  pending: 'bg-fitti-bg-alt text-fitti-text-muted border-fitti-border',
  preparing: 'bg-orange-50 text-fitti-green border-orange-100',
  packed: 'bg-blue-50 text-fitti-green border-blue-100',
  out_for_delivery: 'bg-fitti-bg-alt text-fitti-green border-emerald-100 animate-pulse',
  delivered: 'bg-fitti-green text-white border-fitti-green shadow-lg shadow-fitti-green/20',
};

const STATUS_LABELS = {
  pending: 'Pending Verification',
  preparing: 'In Preparation',
  packed: 'Secured & Packed',
  out_for_delivery: 'In Transit',
  delivered: 'Successfully Delivered',
};

export default function StatusBadge({ status }) {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = STATUS_LABELS[status] || 'Unknown Node';

  return (
    <span className={`px-4 py-1.5 inline-flex text-[10px] font-black uppercase tracking-widest rounded-full border ${colorClass} transition-all duration-300`}>
      {label}
    </span>
  );
}
