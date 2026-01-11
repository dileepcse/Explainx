import React from 'react';
import { ShoppingCart, Package, Tag, Users, Map, BrainCircuit, Activity, Zap, PlayCircle } from 'lucide-react';
import { clsx } from "clsx";
import { EndpointConfig } from '@/lib/types';

interface SidebarProps {
    currentEndpoint: string;
    onSelectEndpoint: (id: string) => void;
}

export const ENDPOINTS: EndpointConfig[] = [
    { id: 'simple', path: '/checkout/simple', method: 'POST', title: 'Simple Checkout', description: 'Basic flow with validation & tax', formType: 'simple' },
    { id: 'full', path: '/checkout/full', method: 'POST', title: 'Full Checkout', description: 'Complete e-commerce flow', formType: 'full' },
    { id: 'resume', path: '/resume/select', method: 'POST', title: 'Resume Selection', description: 'Filter candidates', formType: 'resume' },
    { id: 'products', path: '/products', method: 'GET', title: 'List Products', description: 'Inventory items', formType: 'none' },
    { id: 'promo-codes', path: '/promo-codes', method: 'GET', title: 'Promo Codes', description: 'Available discounts', formType: 'none' },
    { id: 'user-types', path: '/user-types', method: 'GET', title: 'User Types', description: 'Customer tiers', formType: 'none' },
    { id: 'states', path: '/states', method: 'GET', title: 'Tax States', description: 'State tax rates', formType: 'none' },
];

export default function Sidebar({ currentEndpoint, onSelectEndpoint }: SidebarProps) {
    return (
        <aside className="w-[280px] bg-white border-r border-[#e2e8f0] flex flex-col h-full z-20">
            {/* Brand Header */}
            <div className="p-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="bg-[#377dff] p-2 rounded-lg text-white">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-[#1e2022] tracking-tight">ExplainX</h1>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-3 pl-1">
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">API Explorer</span>
                    <span className="bg-[#ebf2ff] text-[#377dff] text-[10px] font-bold px-2 py-0.5 rounded-full">v2.0</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar bg-white">
                {/* Checkout Section */}
                <div>
                    <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ShoppingCart className="w-3 h-3" /> Actions
                    </h3>
                    <ul className="space-y-1">
                        {ENDPOINTS.filter(e => e.method === 'POST').map(endpoint => (
                            <li key={endpoint.id}>
                                <button
                                    onClick={() => onSelectEndpoint(endpoint.id)}
                                    className={clsx(
                                        "w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 relative",
                                        currentEndpoint === endpoint.id
                                            ? "bg-[#ebf2ff] text-[#377dff] font-medium"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <div className={clsx(
                                        "p-1.5 rounded-md transition-colors",
                                        currentEndpoint === endpoint.id ? "bg-white text-[#377dff]" : "bg-gray-100 text-gray-400"
                                    )}>
                                        <PlayCircle className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs">{endpoint.title}</span>
                                    </div>
                                    {currentEndpoint === endpoint.id && <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#377dff] rounded-r-full" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Reference Section */}
                <div>
                    <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Package className="w-3 h-3" /> Data
                    </h3>
                    <ul className="space-y-1">
                        {ENDPOINTS.filter(e => e.method === 'GET').map(endpoint => (
                            <li key={endpoint.id}>
                                <button
                                    onClick={() => onSelectEndpoint(endpoint.id)}
                                    className={clsx(
                                        "w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3",
                                        currentEndpoint === endpoint.id
                                            ? "bg-[#ebf2ff] text-[#377dff] font-medium"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <span className={clsx(
                                        "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                                        "bg-gray-100 text-gray-500 border border-gray-200"
                                    )}>GET</span>
                                    <span className="truncate text-xs">{endpoint.title}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Footer Status */}
            <div className="p-4 border-t border-[#e2e8f0] bg-white">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="font-medium">System Online</span>
                </div>
            </div>
        </aside>
    );
}
