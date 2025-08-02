'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  Zap, 
  Globe, 
  Brain, 
  Rocket, 
  Ship, 
  BarChart3, 
  Cpu, 
  Network,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Generate deterministic neural network nodes
const generateNeuralNodes = (count: number) => {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    // Use deterministic values based on index
    const angle = (i * 137.5) % 360; // Golden angle for good distribution
    const radius = (i * 3.7) % 80 + 10; // Radius between 10% and 90%
    const x = 50 + (radius * Math.cos(angle * Math.PI / 180)) / 2;
    const y = 50 + (radius * Math.sin(angle * Math.PI / 180)) / 2;
    
    // Deterministic size based on index
    const size = 2 + ((i * 7) % 4); // Size between 2 and 6
    
    // Deterministic delay based on index
    const delay = (i * 0.3) % 2; // Delay between 0 and 2 seconds
    
    nodes.push({
      id: i,
      x: Math.round(Math.max(5, Math.min(95, x)) * 100) / 100, // Round to 2 decimal places
      y: Math.round(Math.max(5, Math.min(95, y)) * 100) / 100, // Round to 2 decimal places
      size,
      delay
    });
  }
  return nodes;
};

const FuturisticHero: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" }
    });
  }, [controls]);

  // Floating animation variants
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  // Neural network nodes for background - now deterministic
  const neuralNodes = generateNeuralNodes(50);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`
          }}
        />
        
        {/* Neural Network Background */}
        <svg className="absolute inset-0 w-full h-full">
          {neuralNodes.map((node, index) => (
            <g key={node.id}>
              <motion.circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r={node.size}
                fill="rgba(59, 130, 246, 0.6)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0.3, 0.8, 0.3], 
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + node.delay,
                  repeat: Infinity,
                  delay: node.delay
                }}
              />
              {/* Connect nearby nodes */}
              {neuralNodes.slice(index + 1, index + 3).map((connectedNode, connectionIndex) => (
                <motion.line
                  key={`${node.id}-${connectedNode.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${connectedNode.x}%`}
                  y2={`${connectedNode.y}%`}
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: (node.id + connectionIndex) * 0.1 % 2 // Deterministic delay
                  }}
                />
              ))}
            </g>
          ))}
        </svg>

        {/* Flowing Data Lines */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{
                top: `${10 + i * 10}%`,
                width: '100%',
              }}
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ 
                x: '100%', 
                opacity: [0, 1, 0] 
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full backdrop-blur-sm"
          >
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">
              Powered by Advanced AI
            </span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Welcome to the Future
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              of Freight
            </span>
            <motion.span
              className="inline-block ml-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚡
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            <span className="text-cyan-300 font-semibold">AHS Pakistan</span> introduces the world&apos;s{' '}
            <span className="text-blue-300 font-semibold">smartest freight forwarding assistant</span>.
            Experience lightning-fast quotes, real-time tracking, and AI-powered logistics optimization
            that revolutionizes global shipping.
          </motion.p>

          {/* Feature Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mb-12"
          >
            {[
              { icon: Cpu, label: 'AI-Powered', color: 'text-cyan-400' },
              { icon: Zap, label: 'Instant Quotes', color: 'text-yellow-400' },
              { icon: Globe, label: 'Global Network', color: 'text-blue-400' },
              { icon: BarChart3, label: 'Real-time Analytics', color: 'text-purple-400' },
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                variants={floatingVariants}
                animate="animate"
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl backdrop-blur-sm group-hover:bg-slate-700/50 group-hover:border-slate-600/50 transition-all duration-300 group-hover:scale-110">
                  <feature.icon className={`w-8 h-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <span className="text-sm text-slate-400 mt-2 group-hover:text-slate-200 transition-colors duration-300">
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Primary CTA */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Get Instant Quote</span>
              <Rocket className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>

            {/* Secondary CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-slate-800/50 border border-slate-600/50 text-slate-200 font-semibold rounded-2xl backdrop-blur-sm hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300 flex items-center gap-3 group"
            >
              <Brain className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
              <span>Try Our AI Agent</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { value: '99.9%', label: 'Uptime', icon: Network },
              { value: '<30s', label: 'Quote Time', icon: Zap },
              { value: '150+', label: 'Countries', icon: Globe },
              { value: '24/7', label: 'AI Support', icon: Brain },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                className="text-center group"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 group-hover:text-cyan-200 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating Ship Animation */}
      <motion.div
        className="absolute bottom-10 right-10 hidden lg:block"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Ship className="w-16 h-16 text-cyan-400/30" />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-slate-400/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-slate-400/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FuturisticHero;