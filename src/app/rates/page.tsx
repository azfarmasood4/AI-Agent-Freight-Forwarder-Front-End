'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Rate } from '@/types';
import RateCard from '@/components/RateCard';
import { Search, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RatesPage() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    containerType: '20GP'
  });
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origin.trim() || !formData.destination.trim()) {
      toast.error('Please enter both origin and destination');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Create a search query
      const searchQuery = `Show me rates from ${formData.origin} to ${formData.destination} for ${formData.containerType} container`;
      
      // Use the chat API to get rates
      const response = await api.chat(searchQuery, 'rate-search-session');
      
      if (response.success) {
        // Parse the response to extract rates
        const content = response.agent_response;
        
        // Check if it's a JSON response
        if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
          try {
            const jsonData = JSON.parse(content);
            if (jsonData.rates && Array.isArray(jsonData.rates)) {
              setRates(jsonData.rates);
              toast.success(`Found ${jsonData.rates.length} rates for your search`);
            } else {
              setRates([]);
              toast.error('No rates found for your search criteria');
            }
          } catch {
            setRates([]);
            toast.error('Error parsing rate data');
          }
        } else {
          // Try to parse plain text rates
          const plainTextRates = parsePlainTextRates(content);
          if (plainTextRates && plainTextRates.length > 0) {
            setRates(plainTextRates);
            toast.success(`Found ${plainTextRates.length} rates for your search`);
          } else {
            setRates([]);
            toast.error('No rates found for your search criteria');
          }
        }
      } else {
        setRates([]);
        toast.error('Failed to search rates. Please try again.');
      }
    } catch (error) {
      console.error('Error searching rates:', error);
      setRates([]);
      toast.error('Failed to search rates. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Function to parse plain text rate responses
  const parsePlainTextRates = (content: string): Rate[] | null => {
    try {
      if (!content.includes('🚢') || !content.includes('• Route:')) {
        return null;
      }
      
      const lines = content.split('\n');
      const rates: Rate[] = [];
      let currentRate: Partial<Rate> = {};
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('🚢') && trimmedLine.includes(':')) {
          if (Object.keys(currentRate).length > 0) {
            if (currentRate.carrier && currentRate.origin && currentRate.destination) {
              rates.push(currentRate as Rate);
            }
          }
          
          const carrierMatch = trimmedLine.match(/🚢\s*(?:\(Preferred\)\s*)?([^:]+):/);
          if (carrierMatch) {
            currentRate = {
              quote_id: `generated-${Date.now()}-${rates.length}`,
              carrier: carrierMatch[1].trim(),
              preferred: trimmedLine.includes('(Preferred)'),
              service_level: 'Standard',
              spot_rate_usd: 0,
              total_rate_usd: 0,
              transit_days: 0,
              vessel_name: '',
              departure_date: '',
              arrival_date: '',
              origin: '',
              destination: '',
              container_type: ''
            };
          }
        }
        
        if (currentRate.carrier) {
          if (trimmedLine.includes('• Route:')) {
            const routeMatch = trimmedLine.match(/• Route:\s*([^→]+)→\s*([^•]+)/);
            if (routeMatch) {
              currentRate.origin = routeMatch[1].trim();
              currentRate.destination = routeMatch[2].trim();
            }
          } else if (trimmedLine.includes('• Container:')) {
            const containerMatch = trimmedLine.match(/• Container:\s*([^•]+)/);
            if (containerMatch) {
              currentRate.container_type = containerMatch[1].trim();
            }
          } else if (trimmedLine.includes('• Rate:')) {
            const rateMatch = trimmedLine.match(/• Rate:\s*\$([0-9,]+)/);
            if (rateMatch) {
              const rate = parseInt(rateMatch[1].replace(/,/g, ''));
              currentRate.spot_rate_usd = rate;
              currentRate.total_rate_usd = rate;
            }
          } else if (trimmedLine.includes('• Transit:')) {
            const transitMatch = trimmedLine.match(/• Transit:\s*(\d+)/);
            if (transitMatch) {
              currentRate.transit_days = parseInt(transitMatch[1]);
            }
          } else if (trimmedLine.includes('• Vessel:')) {
            const vesselMatch = trimmedLine.match(/• Vessel:\s*([^•]+)/);
            if (vesselMatch) {
              currentRate.vessel_name = vesselMatch[1].trim();
            }
          } else if (trimmedLine.includes('• Departure:')) {
            const departureMatch = trimmedLine.match(/• Departure:\s*([^•]+)/);
            if (departureMatch) {
              currentRate.departure_date = departureMatch[1].trim();
            }
          } else if (trimmedLine.includes('• Arrival:')) {
            const arrivalMatch = trimmedLine.match(/• Arrival:\s*([^•]+)/);
            if (arrivalMatch) {
              currentRate.arrival_date = arrivalMatch[1].trim();
            }
          }
        }
      }
      
      if (Object.keys(currentRate).length > 0 && currentRate.carrier && currentRate.origin && currentRate.destination) {
        rates.push(currentRate as Rate);
      }
      
      return rates.length > 0 ? rates : null;
    } catch (error) {
      console.error('Error parsing plain text rates:', error);
      return null;
    }
  };

  const handleQuotationRequest = (rate: Rate) => {
    toast.success(`Quotation request for ${rate.carrier} rate from ${rate.origin} to ${rate.destination} prepared!`);
  };

  return (
    <main className="bg-white py-10">
      <section className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-[var(--ahs-primary)] mb-6">
          Rate Search
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                Origin
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--ahs-primary)] focus:ring-[var(--ahs-primary)] sm:text-sm"
                placeholder="Enter origin port"
                required
              />
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--ahs-primary)] focus:ring-[var(--ahs-primary)] sm:text-sm"
                placeholder="Enter destination port"
                required
              />
            </div>

            <div>
              <label htmlFor="containerType" className="block text-sm font-medium text-gray-700">
                Container Type
              </label>
              <select
                id="containerType"
                name="containerType"
                value={formData.containerType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--ahs-primary)] focus:ring-[var(--ahs-primary)] sm:text-sm"
              >
                <option value="20GP">20GP</option>
                <option value="40GP">40GP</option>
                <option value="40HC">40HC</option>
                <option value="20RF">20RF</option>
                <option value="40RF">40RF</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[var(--ahs-primary)] text-white py-2 px-6 rounded-lg shadow-md hover:bg-[var(--ahs-primary-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search Rates</span>
              </>
            )}
          </button>
        </form>

        {/* Results Section */}
        {searched && (
          <div className="mt-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="animate-spin h-8 w-8 text-[var(--ahs-primary)] mx-auto mb-4" />
                  <p className="text-gray-600">Searching for rates...</p>
                </div>
              </div>
            ) : rates.length > 0 ? (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Found {rates.length} Rate{rates.length !== 1 ? 's' : ''}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rates.map((rate, index) => (
                    <RateCard
                      key={rate.quote_id || index}
                      rate={rate}
                      onQuotationRequest={handleQuotationRequest}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Rates Found</h3>
                  <p className="text-gray-500">
                    No shipping rates found for {formData.origin} to {formData.destination} ({formData.containerType}).
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Try different ports or container types.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
