import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export function GlobalDateTimeLocation() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for real-time clock
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const mockLocation = 'Chinatown Branch'; // Hardcoded mock location

  return (
    <div className="flex flex-col items-end text-right text-text-secondary">
      <div className="text-body-small font-semibold">
        {formatDate(currentTime)}
      </div>
      <div className="text-h3 font-bold text-text-primary">
        {formatTime(currentTime)}
      </div>
      <div className="flex items-center gap-1 text-caption text-text-muted">
        <MapPin className="h-3 w-3" />
        <span>{mockLocation}</span>
      </div>
    </div>
  );
}