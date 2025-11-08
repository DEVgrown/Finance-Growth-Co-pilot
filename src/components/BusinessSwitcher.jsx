import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Building2 } from 'lucide-react';

export default function BusinessSwitcher({ activeBusinessId, setActiveBusiness }) {
  const { user, getBusinesses } = useAuth();
  const businesses = getBusinesses();

  if (!user || businesses.length <= 1) {
    return null; // Only show if user is logged in and has more than one business
  }

  return (
    <Select 
      value={activeBusinessId ? String(activeBusinessId) : businesses[0] ? String(businesses[0].id) : ""} 
      onValueChange={(val) => setActiveBusiness(Number(val))}
    >
      <SelectTrigger className="w-[220px] border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100">
        <Building2 className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select Business" />
      </SelectTrigger>
      <SelectContent>
        {businesses.map((business) => (
          <SelectItem key={business.id} value={String(business.id)}>
            {business.name} ({business.role})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
