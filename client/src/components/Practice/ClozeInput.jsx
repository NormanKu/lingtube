import { useState } from 'react';

export function ClozeInput({ blank, onSubmit, revealed }) {
  const [value, setValue] = useState('');
  const [showHint, setShowHint] = useState(false);

  const isCorrect = revealed && value.trim().toLowerCase() === blank.answer.toLowerCase();
  const isIncorrect = revealed && !isCorrect;

  return (
    <span className="inline-flex flex-col items-center mx-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        disabled={revealed}
        placeholder="___"
        className={`w-32 rounded border-b-2 bg-transparent px-2 py-1 text-center text-sm font-medium outline-none transition-colors ${
          revealed
            ? isCorrect
              ? 'border-green-500 text-green-700 bg-green-50'
              : 'border-red-500 text-red-700 bg-red-50'
            : 'border-gray-300 focus:border-primary-500'
        }`}
        style={{ width: `${Math.max(blank.answer.length * 10, 80)}px` }}
      />
      {isIncorrect && (
        <span className="mt-1 text-xs text-green-600">{blank.answer}</span>
      )}
      {!revealed && showHint && (
        <span className="mt-1 text-xs text-gray-400">{blank.hint}</span>
      )}
      {!revealed && !showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="mt-1 text-xs text-primary-400 hover:text-primary-600"
        >
          hint
        </button>
      )}
    </span>
  );
}
