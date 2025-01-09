import { TimeLeft } from '@/types';

interface CountdownDisplayProps {
  timeLeft: TimeLeft;
}

export function CountdownDisplay({ timeLeft }: CountdownDisplayProps) {
  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-4 w-full max-w-2xl mx-auto px-2 sm:px-4">
      {[
        { value: days, label: 'DAYS' },
        { value: hours, label: 'HOURS' },
        { value: minutes, label: 'MINUTES' },
        { value: seconds, label: 'SECONDS' },
      ].map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-full aspect-[3/4] bg-blue-500/10 backdrop-blur-lg rounded-lg sm:rounded-xl flex items-center justify-center">
            <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-blue-500">
              {value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] xs:text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}