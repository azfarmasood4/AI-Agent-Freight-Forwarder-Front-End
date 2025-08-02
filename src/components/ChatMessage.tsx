'use client';

import { ChatMessage as ChatMessageType, Rate } from '@/types';
import { User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { parseRateResponse } from '@/lib/utils';
import RateCard from './RateCard';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuotationRequest?: (rate: Rate) => void;
}

// Function to parse plain text rate responses and extract rate information
function parsePlainTextRates(content: string): Rate[] | null {
  try {
         // Quick check - if content doesn't contain rate indicators, return null immediately
     if (!content.includes('• Container:') && !content.includes('• Rate:') && !content.includes('• Transit:') && !content.includes('Route:')) {
       return null;
     }
    
    const lines = content.split('\n');
    const rates: Rate[] = [];
    let currentRate: Partial<Rate> = {};
    let rateCounter = 0;
    let origin = '';
    let destination = '';
    
         // Extract origin and destination from the welcome message
     const welcomeMatch = content.match(/rates from ([^to]+) to ([^(]+)/i);
     if (welcomeMatch) {
       origin = welcomeMatch[1].trim();
       destination = welcomeMatch[2].trim();
     }
     
     // Also try to extract from "Once you provide these" format
     const routeMatch = content.match(/Route:\s*([^→]+)→\s*([^•]+)/);
     if (routeMatch && !origin && !destination) {
       origin = routeMatch[1].trim();
       destination = routeMatch[2].trim();
     }
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
             // Check for carrier line (CMA CGM (Recommended): or MSC:)
       if (trimmedLine.includes(':') && !trimmedLine.includes('•') && 
           (trimmedLine.includes('CMA CGM') || trimmedLine.includes('MSC') || 
            trimmedLine.includes('Maersk') || trimmedLine.includes('Hapag-Lloyd') ||
            trimmedLine.includes('ONE') || trimmedLine.includes('Carrier'))) {
        
        if (Object.keys(currentRate).length > 0) {
          // Save previous rate if exists
          if (currentRate.carrier && currentRate.container_type && currentRate.spot_rate_usd) {
            // Ensure quote_id is never empty
            if (!currentRate.quote_id || currentRate.quote_id === '') {
              currentRate.quote_id = `generated-${rateCounter}-${currentRate.carrier.replace(/\s+/g, '-')}`;
            }
            rates.push(currentRate as Rate);
            rateCounter++;
          }
        }
        
        // Start new rate
        const carrierMatch = trimmedLine.match(/([^(]+)(?:\s*\([^)]+\))?:/);
        if (carrierMatch) {
          currentRate = {
            quote_id: `generated-${rateCounter}-${carrierMatch[1].trim().replace(/\s+/g, '-')}`,
            carrier: carrierMatch[1].trim(),
            preferred: trimmedLine.includes('(Recommended)') || trimmedLine.includes('(Preferred)'),
            service_level: 'Standard',
            spot_rate_usd: 0,
            total_rate_usd: 0,
            transit_days: 0,
            vessel_name: '',
            departure_date: '',
            arrival_date: '',
            origin: origin,
            destination: destination,
            container_type: ''
          };
        }
      }
      
      // Parse rate details
      if (currentRate.carrier) {
        if (trimmedLine.includes('• Container:')) {
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
    
    // Add the last rate
    if (Object.keys(currentRate).length > 0 && currentRate.carrier && currentRate.container_type && currentRate.spot_rate_usd) {
      // Ensure quote_id is never empty for the last rate
      if (!currentRate.quote_id || currentRate.quote_id === '') {
        currentRate.quote_id = `generated-${rateCounter}-${currentRate.carrier.replace(/\s+/g, '-')}`;
      }
      rates.push(currentRate as Rate);
    }
    
         // If no rates were found with the normal parsing, try to parse a single rate block
     if (rates.length === 0 && content.includes('Route:') && content.includes('• Container:')) {
       const routeMatch = content.match(/Route:\s*([^→]+)→\s*([^•]+)/);
       const containerMatch = content.match(/• Container:\s*([^•]+)/);
       const rateMatch = content.match(/• Rate:\s*\$([0-9,]+)/);
       const transitMatch = content.match(/• Transit:\s*(\d+)/);
       const vesselMatch = content.match(/• Vessel:\s*([^•]+)/);
       const departureMatch = content.match(/• Departure:\s*([^•]+)/);
       const arrivalMatch = content.match(/• Arrival:\s*([^•]+)/);
       
       if (routeMatch && containerMatch && rateMatch) {
         const rate: Rate = {
           quote_id: `generated-single-${Date.now()}`,
           carrier: 'CMA CGM', // Default carrier
           preferred: true,
           service_level: 'Standard',
           spot_rate_usd: parseInt(rateMatch[1].replace(/,/g, '')),
           total_rate_usd: parseInt(rateMatch[1].replace(/,/g, '')),
           transit_days: transitMatch ? parseInt(transitMatch[1]) : 0,
           vessel_name: vesselMatch ? vesselMatch[1].trim() : '',
           departure_date: departureMatch ? departureMatch[1].trim() : '',
           arrival_date: arrivalMatch ? arrivalMatch[1].trim() : '',
           origin: routeMatch[1].trim(),
           destination: routeMatch[2].trim(),
           container_type: containerMatch[1].trim()
         };
         rates.push(rate);
       }
     }
     
     // Final validation: ensure all rates have valid quote_id
     const validatedRates = rates.map((rate, index) => {
       if (!rate.quote_id || rate.quote_id === '') {
         return {
           ...rate,
           quote_id: `fallback-${index}-${rate.carrier?.replace(/\s+/g, '-') || 'unknown'}`
         };
       }
       return rate;
     });
     
     return validatedRates.length > 0 ? validatedRates : null;
  } catch (error) {
    console.error('Error parsing plain text rates:', error);
    return null;
  }
}

export default function ChatMessage({ message, onQuotationRequest }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // Generate a stable base key for this message that doesn't change on re-renders
  const messageBaseKey = useMemo(() => {
    const messageId = message.id || `fallback-${message.timestamp?.getTime() || Date.now()}`;
    return `msg-${messageId}`;
  }, [message.id, message.timestamp]);
  
     // Memoize rate parsing to prevent unnecessary re-renders
   const { rateResponse, plainTextRates } = useMemo(() => {
     const rateResponse = message.isRateResponse ? parseRateResponse(message.content) : null;
     const plainTextRates = !rateResponse && !isUser && 
       (message.content.includes('• Container:') || message.content.includes('• Rate:') || message.content.includes('Route:')) ? 
       parsePlainTextRates(message.content) : null;
    
    // Debug logging
    if (rateResponse?.rates) {
      console.log('Rate response rates:', rateResponse.rates.map((r, i) => ({ 
        index: i, 
        quote_id: r.quote_id || 'MISSING',
        carrier: r.carrier 
      })));
    }
    if (plainTextRates) {
      console.log('Plain text rates:', plainTextRates.map((r, i) => ({ 
        index: i, 
        quote_id: r.quote_id || 'MISSING',
        carrier: r.carrier 
      })));
    }
    
    return { rateResponse, plainTextRates };
  }, [message.content, message.isRateResponse, isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-3 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg' 
            : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50'
        }`}>
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-cyan-400" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <p className="text-xs text-slate-400 mb-1">
            {isUser ? 'You' : 'AHS Assistant'}
          </p>
          
          {rateResponse ? (
            // Display rate cards if it's a JSON rate response (for backward compatibility)
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/30">
                <p className="text-slate-200 mb-2">{rateResponse.message}</p>
                {rateResponse.search_criteria && (
                  <div className="text-sm text-slate-400 mb-2">
                    <span className="font-medium text-cyan-300">Search criteria:</span>
                    {rateResponse.search_criteria.origin && ` Origin: ${rateResponse.search_criteria.origin}`}
                    {rateResponse.search_criteria.destination && ` → Destination: ${rateResponse.search_criteria.destination}`}
                    {rateResponse.search_criteria.container_type && ` • Container: ${rateResponse.search_criteria.container_type}`}
                  </div>
                )}
              </div>
              
                {rateResponse.rates && rateResponse.rates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rateResponse.rates.slice(0, 6).map((rate, index) => {
                    // Use stable keys based on message and rate data
                    const uniqueKey = rate.quote_id && rate.quote_id !== '' 
                      ? `${messageBaseKey}-${rate.quote_id}` 
                      : `${messageBaseKey}-rate-${index}-${rate.carrier || 'unknown'}-${rate.spot_rate_usd || 0}`;
                    
                    console.log('RateCard key:', { uniqueKey, quote_id: rate.quote_id, carrier: rate.carrier, index });
                    
                    return (
                      <RateCard
                        key={uniqueKey}
                        rate={rate}
                        onQuotationRequest={onQuotationRequest}
                        index={index}
                      />
                    );
                  })}
                </div>
              )}
              
              {rateResponse.available_origins && rateResponse.available_origins.length > 0 && (
                <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
                  <p className="text-sm text-cyan-200 font-medium mb-2">Available ports:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-cyan-300 font-medium">Origins:</p>
                      <p className="text-xs text-slate-300">{rateResponse.available_origins.slice(0, 5).join(', ')}</p>
                    </div>
                    {rateResponse.available_destinations && (
                      <div>
                        <p className="text-xs text-cyan-300 font-medium">Destinations:</p>
                        <p className="text-xs text-slate-300">{rateResponse.available_destinations.slice(0, 5).join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : plainTextRates ? (
            // Display rate cards for parsed plain text rates
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/30"
              >
                <p className="text-slate-200 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  I found some great shipping rates for you! Here are the options:
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plainTextRates.slice(0, 6).map((rate, index) => {
                  // Use stable keys based on message and rate data
                  const uniqueKey = rate.quote_id && rate.quote_id !== '' 
                    ? `${messageBaseKey}-${rate.quote_id}` 
                    : `${messageBaseKey}-plain-${index}-${rate.carrier || 'unknown'}-${rate.spot_rate_usd || 0}`;
                  
                  console.log('PlainText RateCard key:', { uniqueKey, quote_id: rate.quote_id, carrier: rate.carrier, index });
                  
                  return (
                    <RateCard
                      key={uniqueKey}
                      rate={rate}
                      onQuotationRequest={onQuotationRequest}
                      index={index}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            // Regular message
            <div className={`inline-block px-4 py-3 rounded-2xl backdrop-blur-sm ${
              isUser 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                : 'bg-gradient-to-r from-slate-800/50 to-slate-900/50 text-slate-200 border border-slate-700/30'
            }`}>
              <div className="prose prose-sm max-w-none">
                {(() => {
                  // Check if content is JSON and try to parse as rate response
                  const isJsonResponse = message.content.trim().startsWith('{') && message.content.trim().endsWith('}');
                  
                  if (isJsonResponse && !isUser) {
                    try {
                      const jsonData = JSON.parse(message.content);
                      
                      // Check if it's a rate response with rates array
                      if (jsonData.rates && Array.isArray(jsonData.rates) && jsonData.rates.length > 0) {
                        // This is a rate response - render rate cards directly here
                        return (
                          <div className="space-y-4 w-full max-w-none">
                            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/30">
                              <p className="text-slate-200 mb-2">{jsonData.message || 'Found shipping rates for your request'}</p>
                              {jsonData.search_criteria && (
                                <div className="text-sm text-slate-400 mb-2">
                                  <span className="font-medium text-cyan-300">Search criteria:</span>
                                  {jsonData.search_criteria.origin && ` Origin: ${jsonData.search_criteria.origin}`}
                                  {jsonData.search_criteria.destination && ` → Destination: ${jsonData.search_criteria.destination}`}
                                  {jsonData.search_criteria.container_type && ` • Container: ${jsonData.search_criteria.container_type}`}
                                </div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {jsonData.rates.slice(0, 6).map((rate: Rate, index: number) => {
                                // Use stable keys based on message and rate data
                                const uniqueKey = rate.quote_id && rate.quote_id !== '' 
                                  ? `${messageBaseKey}-${rate.quote_id}` 
                                  : `${messageBaseKey}-json-${index}-${rate.carrier || 'unknown'}-${rate.spot_rate_usd || 0}`;
                                
                                return (
                                  <RateCard
                                    key={uniqueKey}
                                    rate={rate}
                                    onQuotationRequest={onQuotationRequest}
                                    index={index}
                                  />
                                );
                              })}
                            </div>
                            
                            {jsonData.available_origins && jsonData.available_origins.length > 0 && (
                              <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
                                <p className="text-sm text-cyan-200 font-medium mb-2">Available ports:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  <div>
                                    <p className="text-xs text-cyan-300 font-medium">Origins:</p>
                                    <p className="text-xs text-slate-300">{jsonData.available_origins.slice(0, 5).join(', ')}</p>
                                  </div>
                                  {jsonData.available_destinations && (
                                    <div>
                                      <p className="text-xs text-cyan-300 font-medium">Destinations:</p>
                                      <p className="text-xs text-slate-300">{jsonData.available_destinations.slice(0, 5).join(', ')}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      // For other JSON responses (like error messages), display them nicely
                      if (jsonData.message && !jsonData.rates) {
                        return (
                          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-2xl p-4 backdrop-blur-sm">
                            <p className="text-yellow-200">{jsonData.message}</p>
                            {jsonData.available_origins && jsonData.available_origins.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-yellow-300 font-medium">Available origins:</p>
                                <p className="text-sm text-slate-300">{jsonData.available_origins.slice(0, 10).join(', ')}</p>
                              </div>
                            )}
                            {jsonData.available_destinations && jsonData.available_destinations.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-yellow-300 font-medium">Available destinations:</p>
                                <p className="text-sm text-slate-300">{jsonData.available_destinations.slice(0, 10).join(', ')}</p>
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      // Fallback for unrecognized JSON structure
                      return (
                        <div className="space-y-3">
                          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-2xl p-3 backdrop-blur-sm">
                            <p className="text-sm text-cyan-200 font-medium mb-2">📊 Technical Response</p>
                            <p className="text-xs text-slate-300">The AI returned structured data that couldn&apos;t be formatted for display.</p>
                          </div>
                          <pre className="bg-slate-800 text-cyan-400 p-4 rounded-2xl overflow-x-auto text-sm border border-slate-700/30">
                            <code>{JSON.stringify(jsonData, null, 2)}</code>
                          </pre>
                        </div>
                      );
                    } catch (e) {
                      console.error("JSON parsing failed. Falling back to markdown:", e);
                    }
                  }
                  
                  // Regular markdown rendering for non-JSON responses
                  return (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        code: ({ children }) => (
                          <code className={`${isUser ? 'bg-white bg-opacity-20' : 'bg-slate-700'} px-1 py-0.5 rounded text-sm`}>
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-slate-800 text-cyan-400 p-3 rounded-2xl overflow-x-auto text-sm my-2 border border-slate-700/30">
                            {children}
                          </pre>
                        ),
                        a: ({ children, href }) => (
                          <a href={href} className="underline hover:no-underline text-cyan-300" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
