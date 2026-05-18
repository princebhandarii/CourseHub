import { Star } from 'lucide-react';

export default function StarRating({ rating, onChange, readonly = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'hover:scale-125 cursor-pointer'}`}
        >
          <Star
            className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        </button>
      ))}
    </div>
  );
}
