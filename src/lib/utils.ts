import { format, parseISO } from 'date-fns';
import { RateResponse } from '@/types';

export function formatDate(date: string | Date): string {
  try {
    if (!date) return 'N/A';
    
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Handle different date formats
      if (date === 'N/A' || date === '' || date === 'null' || date === 'undefined') {
        return 'N/A';
      }
      
      // Try to parse the date string
      dateObj = parseISO(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
    } else {
      dateObj = date;
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
    }
    
    return format(dateObj, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error, 'Date value:', date);
    return 'N/A';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Session ID generation removed - now handled manually in useSession hook

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function isRateResponse(content: string): boolean {
  try {
    const trimmed = content.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      return false;
    }

    const parsed = JSON.parse(trimmed);
    
    // Primary check: has rates array
    if (parsed.rates && Array.isArray(parsed.rates)) {
      return true;
    }
    
    // Secondary check: single rate object with required fields
    if (parsed.quote_id && parsed.origin && parsed.destination) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('Rate detection failed:', error);
    return false;
  }
}

export function parseRateResponse(content: string): RateResponse | null {
  try {
    const trimmed = content.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      return null;
    }

    const parsed = JSON.parse(trimmed);
    
    // If it already has a rates array, return it
    if (parsed.rates !== undefined && Array.isArray(parsed.rates)) {
      return parsed as RateResponse;
    }
    
    // If it's a single rate object, wrap it in a rates array
    if (parsed.quote_id || (parsed.origin && parsed.destination && parsed.spot_rate_usd)) {
      return {
        rates: [parsed],
        message: parsed.message || `Found shipping rate from ${parsed.origin || 'origin'} to ${parsed.destination || 'destination'}`,
        total_options: 1,
        search_criteria: {
          origin: parsed.origin,
          destination: parsed.destination,
          container_type: parsed.container_type
        }
      } as RateResponse;
    }
    
    return null;
  } catch (e) {
    console.error('Error parsing rate response:', e);
    return null;
  }
}

export function getContainerTypeDisplay(type: string): string {
  const containerTypes: Record<string, string> = {
    '20GP': '20ft General Purpose',
    '40GP': '40ft General Purpose',
    '40HC': '40ft High Cube',
    '20RF': '20ft Reefer',
    '40RF': '40ft Reefer',
  };
  return containerTypes[type] || type;
}

export function getCarrierLogo(carrier: string): string {
  // In a real app, you'd have actual logo URLs
  const logos: Record<string, string> = {
    'CMA CGM': '/carriers/cma-cgm.png',
    'MSC': '/carriers/msc.png',
    'Maersk': '/carriers/maersk.png',
    'Hapag-Lloyd': '/carriers/hapag-lloyd.png',
    'ONE': '/carriers/one.png',
  };
  return logos[carrier] || '/carriers/default.png';
}
