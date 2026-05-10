const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-500 border-gray-200',
  preparing: 'bg-orange-50 text-orange-600 border-orange-100',
  packed: 'bg-blue-50 text-blue-600 border-blue-100',
  out_for_delivery: 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse',
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
