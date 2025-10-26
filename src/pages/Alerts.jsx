import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function Alerts() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.alerts.list()
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Alerts</h1>
      {isLoading ? (
        <div>Loading alerts...</div>
      ) : (
        <div className="grid gap-4">
          {alerts.map(alert => (
            <div 
              key={alert.id}
              className="p-4 rounded-lg border bg-card"
            >
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}