'use client';

import { Rate } from '@/types';
import { formatCurrency, formatDate, getContainerTypeDisplay } from '@/lib/utils';
import { Ship, Calendar, Clock, Star, AlertCircle, Package, Zap, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface RateCardProps {
  rate: Rate;
  onQuotationRequest?: (rate: Rate) => void;
  index?: number;
}

export default function RateCard({ rate, onQuotationRequest, index = 0 }: RateCardProps) {
  const isPreferred = rate.preferred || rate.carrier === 'CMA CGM';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border overflow-hidden group ${
        isPreferred 
          ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
          : 'border-slate-600/50 shadow-lg shadow-slate-900/20'
      }`}
    >
      {/* Futuristic Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isPreferred ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10' : 'bg-gradient-to-r from-slate-500/10 to-slate-400/10'
      }`} />
      
      {/* Header */}
      <div className={`relative p-5 ${
        isPreferred 
          ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50' 
          : 'bg-gradient-to-r from-slate-700/50 to-slate-800/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              isPreferred 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <Ship className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">
                {rate.carrier}
              </h3>
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <Globe className="w-3 h-3" />
                {rate.vessel_name} • {rate.voyage || 'Direct Service'}
              </p>
            </div>
          </div>
          {isPreferred && (
            <motion.div 
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 px-4 py-2 rounded-full backdrop-blur-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Sparkles className="h-3 w-3 text-yellow-400" />
              <span className="text-sm text-yellow-200 font-semibold">Preferred</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Futuristic Route Information */}
      <div className="relative p-5 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Origin</p>
            <p className="font-bold text-lg text-white mt-1">{rate.origin}</p>
            <p className="text-xs text-cyan-400">{rate.origin_code}</p>
          </div>
          
          <div className="flex-1 px-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full h-0.5 ${
                  isPreferred 
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500' 
                    : 'bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500'
                }`}></div>
              </div>
              <div className="relative flex justify-center">
                <motion.div
                  className={`px-4 py-2 rounded-full backdrop-blur-sm border ${
                    isPreferred 
                      ? 'bg-cyan-900/50 border-cyan-500/30 text-cyan-200' 
                      : 'bg-slate-800/50 border-slate-500/30 text-slate-300'
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3 h-3" />
                    <span className="text-sm font-semibold">{rate.transit_days} days</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Destination</p>
            <p className="font-bold text-lg text-white mt-1">{rate.destination}</p>
            <p className="text-xs text-cyan-400">{rate.destination_code}</p>
          </div>
        </div>
      </div>

      {/* Futuristic Details Grid */}
      <div className="p-5 grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 backdrop-blur-sm">
          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <Package className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Container</p>
            <p className="text-sm font-semibold text-white">{getContainerTypeDisplay(rate.container_type)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 backdrop-blur-sm">
          <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
            <Calendar className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Departure</p>
            <p className="text-sm font-semibold text-white">{rate.departure_date ? formatDate(rate.departure_date) : 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 backdrop-blur-sm">
          <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Arrival</p>
            <p className="text-sm font-semibold text-white">{rate.arrival_date ? formatDate(rate.arrival_date) : 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 backdrop-blur-sm">
          <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Valid Until</p>
            <p className="text-sm font-semibold text-yellow-300">
              {rate.validity_until && rate.validity_until !== 'N/A' ? formatDate(rate.validity_until) : '24 Hours'}
            </p>
          </div>
        </div>
      </div>

      {/* Futuristic Pricing Section */}
      <div className="p-5 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-t border-slate-700/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Ocean Freight</p>
            <p className={`text-3xl font-bold ${
              isPreferred ? 'text-cyan-300' : 'text-white'
            }`}>
              {formatCurrency(rate.spot_rate_usd)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Service Level</p>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
              isPreferred 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                : 'bg-slate-600/50 text-slate-200 border border-slate-500/30'
            }`}>
              {rate.service_level}
            </div>
          </div>
        </div>
        
        {/* Futuristic Additional Info */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <p className="text-xs text-slate-400">Free Days</p>
            <p className="text-sm font-bold text-white">{rate.free_days || 3}</p>
          </div>
          <div className="text-center p-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <p className="text-xs text-slate-400">Detention</p>
            <p className="text-sm font-bold text-white">{formatCurrency(rate.detention_per_day || 25)}/day</p>
          </div>
          <div className="text-center p-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <p className="text-xs text-slate-400">Service</p>
            <p className="text-sm font-bold text-white">{rate.frequency || 'Weekly'}</p>
          </div>
        </div>

        {/* Futuristic Action Button */}
        {onQuotationRequest && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onQuotationRequest(rate)}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
              isPreferred
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-lg shadow-slate-900/25'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Request Quotation
              <Zap className="w-4 h-4" />
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
