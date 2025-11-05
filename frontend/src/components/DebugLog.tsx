import React, { useState, useEffect } from 'react';

interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'error' | 'success';
  timestamp: number;
}

let logId = 0;
const logs: LogEntry[] = [];
const listeners: ((logs: LogEntry[]) => void)[] = [];

export const addDebugLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
  const entry: LogEntry = {
    id: logId++,
    message,
    type,
    timestamp: Date.now()
  };

  logs.push(entry);

  // Keep only last 5 logs
  if (logs.length > 5) {
    logs.shift();
  }

  // Notify all listeners
  listeners.forEach(listener => listener([...logs]));

  // Auto-remove after 2 seconds
  setTimeout(() => {
    const index = logs.findIndex(log => log.id === entry.id);
    if (index > -1) {
      logs.splice(index, 1);
      listeners.forEach(listener => listener([...logs]));
    }
  }, 2000);
};

const DebugLog: React.FC = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = (newLogs: LogEntry[]) => {
      setLogEntries(newLogs);
    };

    listeners.push(listener);

    // Force re-render every 50ms for smooth fade animation
    const intervalId = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 50);

    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      clearInterval(intervalId);
    };
  }, []);

  if (logEntries.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '70px',
      left: '8px',
      right: '8px',
      zIndex: 9999,
      pointerEvents: 'none'
    }}>
      {logEntries.map((entry) => {
        const now = Date.now();
        const age = now - entry.timestamp;

        // 2000ms total: 1200ms static (opacity 1), then 800ms fade out
        let opacity = 1;
        if (age > 1200) {
          const fadeAge = age - 1200;
          opacity = Math.max(0, 1 - (fadeAge / 800));
        }

        let bgColor = 'rgba(0, 0, 0, 0.85)';
        let textColor = '#fff';

        if (entry.type === 'error') {
          bgColor = 'rgba(220, 38, 38, 0.9)';
        } else if (entry.type === 'success') {
          bgColor = 'rgba(34, 197, 94, 0.9)';
        }

        return (
          <div
            key={entry.id}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: '8px 12px',
              marginBottom: '4px',
              borderRadius: '8px',
              fontSize: '12px',
              lineHeight: '1.4',
              fontFamily: 'monospace',
              wordBreak: 'break-word',
              opacity: opacity,
              transition: 'opacity 0.3s ease-out',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {entry.message}
          </div>
        );
      })}
    </div>
  );
};

export default DebugLog;
