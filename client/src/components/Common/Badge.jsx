const categoryColors = {
  daily: 'bg-blue-100 text-blue-700',
  business: 'bg-purple-100 text-purple-700',
  grammar: 'bg-amber-100 text-amber-700',
  idiom: 'bg-green-100 text-green-700',
  slang: 'bg-pink-100 text-pink-700',
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export function Badge({ label, type = 'daily', className = '' }) {
  const color = categoryColors[type] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${className}`}>
      {label}
    </span>
  );
}
