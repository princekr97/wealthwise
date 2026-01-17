/**
 * Gradient Showcase Component
 * Displays all available professional gradients with live preview
 */

import React, { useState } from 'react';
import { gradients, gradientCategories, getGradientsByCategory } from '../theme/gradients';

const GradientShowcase = () => {
    const [selectedGradient, setSelectedGradient] = useState('sophisticatedNavy');
    const [showGlassmorphism, setShowGlassmorphism] = useState(false);

    const categories = Object.keys(gradientCategories);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Professional Gradient Collection
                </h1>
                <p className="text-slate-400 text-lg">
                    Premium, clean, and attractive gradient combinations for modern applications
                </p>
            </div>

            {/* Hero Preview */}
            <div className="max-w-7xl mx-auto mb-12">
                <div
                    className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${showGlassmorphism ? 'gradient-glass' : ''
                        }`}
                    style={{
                        background: gradients[selectedGradient]?.gradient,
                        minHeight: '400px',
                        backdropFilter: showGlassmorphism ? 'blur(20px)' : 'none'
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="text-center">
                            <h2
                                className="text-5xl md:text-7xl font-bold mb-4"
                                style={{ color: gradients[selectedGradient]?.textColor }}
                            >
                                {gradients[selectedGradient]?.name}
                            </h2>
                            <p
                                className="text-lg md:text-xl opacity-90 max-w-2xl"
                                style={{ color: gradients[selectedGradient]?.textColor }}
                            >
                                {gradients[selectedGradient]?.description}
                            </p>

                            {/* Glassmorphism Toggle */}
                            <div className="mt-8">
                                <button
                                    onClick={() => setShowGlassmorphism(!showGlassmorphism)}
                                    className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                                    style={{ color: gradients[selectedGradient]?.textColor }}
                                >
                                    {showGlassmorphism ? '✨ Glassmorphism ON' : '💎 Enable Glassmorphism'}
                                </button>
                            </div>

                            {/* Gradient Code */}
                            <div className="mt-6">
                                <code
                                    className="px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm text-sm font-mono inline-block"
                                    style={{ color: gradients[selectedGradient]?.textColor }}
                                >
                                    {gradients[selectedGradient]?.gradient}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gradient Grid by Category */}
            <div className="max-w-7xl mx-auto space-y-12">
                {categories.map((category) => {
                    const categoryGradients = getGradientsByCategory(category);

                    if (categoryGradients.length === 0) return null;

                    return (
                        <div key={category} className="space-y-4">
                            <h3 className="text-2xl font-bold text-slate-200">
                                {gradientCategories[category]}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categoryGradients.map(({ key, name, gradient, description, textColor }) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedGradient(key)}
                                        className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${selectedGradient === key ? 'ring-4 ring-blue-500' : ''
                                            }`}
                                        style={{
                                            background: gradient,
                                            minHeight: '180px'
                                        }}
                                    >
                                        <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                            <div>
                                                <h4
                                                    className="text-xl font-bold mb-2"
                                                    style={{ color: textColor }}
                                                >
                                                    {name}
                                                </h4>
                                                <p
                                                    className="text-sm opacity-80 line-clamp-2"
                                                    style={{ color: textColor }}
                                                >
                                                    {description}
                                                </p>
                                            </div>

                                            {/* Tailwind Class Name */}
                                            <div className="mt-4">
                                                <code
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm inline-block font-mono"
                                                    style={{ color: textColor }}
                                                >
                                                    bg-gradient-{key.replace(/([A-Z])/g, '-$1').toLowerCase()}
                                                </code>
                                            </div>
                                        </div>

                                        {/* Hover Effect */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Usage Examples */}
            <div className="max-w-7xl mx-auto mt-16 p-8 bg-slate-900/50 rounded-2xl backdrop-blur-xl border border-slate-700">
                <h3 className="text-2xl font-bold mb-6">💡 Usage Examples</h3>

                <div className="space-y-6">
                    {/* Tailwind Example */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-emerald-400">1. Using with Tailwind</h4>
                        <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm text-slate-300">
                                {`<div className="bg-gradient-sophisticated-navy rounded-xl p-8">
  <h1 className="text-white">Your Content</h1>
</div>`}
                            </code>
                        </pre>
                    </div>

                    {/* React Inline Style Example */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-blue-400">2. Using with React Inline Styles</h4>
                        <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm text-slate-300">
                                {`import { gradients } from './theme/gradients';

<div style={{ background: gradients.sophisticatedNavy.gradient }}>
  <h1 style={{ color: gradients.sophisticatedNavy.textColor }}>
    Your Content
  </h1>
</div>`}
                            </code>
                        </pre>
                    </div>

                    {/* Glassmorphism Example */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-purple-400">3. Adding Glassmorphism Effect</h4>
                        <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm text-slate-300">
                                {`<div className="bg-gradient-frosted-glass gradient-glass rounded-xl p-8">
  <h1 className="text-white">Glassmorphism Effect</h1>
</div>`}
                            </code>
                        </pre>
                    </div>

                    {/* Animated Gradient Example */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-pink-400">4. Animated Gradient</h4>
                        <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm text-slate-300">
                                {`<div className="bg-gradient-cosmic-purple gradient-animated rounded-xl p-8">
  <h1 className="text-white">Animated Background</h1>
</div>`}
                            </code>
                        </pre>
                    </div>

                    {/* Gradient Text Example */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-yellow-400">5. Gradient Text</h4>
                        <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm text-slate-300">
                                {`<h1 className="gradient-text bg-gradient-sunset text-5xl font-bold">
  Gradient Text
</h1>`}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>

            {/* Pro Tips */}
            <div className="max-w-7xl mx-auto mt-12 p-8 bg-gradient-to-br from-emerald-900/20 to-blue-900/20 rounded-2xl border border-emerald-500/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span>✨</span> Pro Tips for Premium Gradients
                </h3>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
                    <div className="flex gap-3">
                        <span className="text-emerald-400">•</span>
                        <div>
                            <strong className="text-white">Angle matters:</strong> 135deg gives the most natural, diagonal flow
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-blue-400">•</span>
                        <div>
                            <strong className="text-white">Limit colors:</strong> 2-3 colors max for professional look
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-purple-400">•</span>
                        <div>
                            <strong className="text-white">Subtle transitions:</strong> Close color values = sophisticated
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-pink-400">•</span>
                        <div>
                            <strong className="text-white">Add depth:</strong> Combine with blur effects for glassmorphism
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-yellow-400">•</span>
                        <div>
                            <strong className="text-white">Test readability:</strong> Ensure text is readable on your gradient
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-cyan-400">•</span>
                        <div>
                            <strong className="text-white">Brand consistency:</strong> Pick 2-3 gradients for your entire app
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradientShowcase;
