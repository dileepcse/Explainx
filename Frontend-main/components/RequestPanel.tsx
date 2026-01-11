import React, { useState } from 'react';
import { Play, RotateCw, Settings, Info, CreditCard, Box, Tag, Truck } from 'lucide-react';
import { EndpointConfig } from '@/lib/types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface RequestPanelProps {
    endpoint: EndpointConfig;
    onExecute: (data: any) => void;
    isLoading: boolean;
}

export default function RequestPanel({ endpoint, onExecute, isLoading }: RequestPanelProps) {
    // Simple Form State
    const [simpleForm, setSimpleForm] = useState({ price: 100, user_type: 'premium' });

    // Full Form State
    const [fullForm, setFullForm] = useState({
        product_id: 'LAPTOP-001',
        quantity: 1,
        user_type: 'premium',
        state: 'CA',
        promo_code: '',
        express_shipping: false
    });

    // Resume Form State
    const [resumeForm, setResumeForm] = useState({
        domain: 'backend',
        min_experience: 3.0,
        salary_budget: 120000
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (endpoint.formType === 'simple') onExecute(simpleForm);
        else if (endpoint.formType === 'full') onExecute(fullForm);
        else if (endpoint.formType === 'resume') {
            const formData = new FormData();
            formData.append('domain', resumeForm.domain);
            formData.append('min_experience', String(resumeForm.min_experience));
            formData.append('salary_budget', String(resumeForm.salary_budget));
            if (resumeFile) {
                formData.append('file', resumeFile);
            }
            onExecute(formData);
        }
        else onExecute({});
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-8 border-b border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-2">
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <h2 className="text-xl font-bold text-[#1e2022] tracking-tight">{endpoint.title}</h2>
                    </motion.div>

                    <span className={clsx(
                        "px-3 py-1 rounded-full text-[11px] font-bold tracking-wide",
                        endpoint.method === 'POST'
                            ? "bg-[#ebf2ff] text-[#377dff]"
                            : "bg-emerald-50 text-emerald-600"
                    )}>{endpoint.method}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{endpoint.description}</p>

                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 w-fit">
                    <span className="text-[#377dff] font-bold">{endpoint.method}</span>
                    <span className="select-all">/api{endpoint.path}</span>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
                    {endpoint.formType === 'simple' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="grid gap-6"
                        >
                            <InputGroup label="Price">
                                <input
                                    type="number"
                                    value={simpleForm.price}
                                    onChange={e => setSimpleForm({ ...simpleForm, price: Number(e.target.value) })}
                                    className="clean-input w-full p-2.5 rounded-lg text-sm"
                                    placeholder="Enter price"
                                    title="Price"
                                />
                            </InputGroup>

                            <InputGroup label="User Type">
                                <select
                                    value={simpleForm.user_type}
                                    onChange={e => setSimpleForm({ ...simpleForm, user_type: e.target.value })}
                                    className="clean-input w-full p-2.5 rounded-lg text-sm"
                                    aria-label="Product"
                                    title="Product"
                                >
                                    <option value="premium">Premium (20% off)</option>
                                    <option value="standard">Standard (10% off)</option>
                                    <option value="guest">Guest (0% off)</option>
                                </select>
                            </InputGroup>
                        </motion.div>
                    )}

                    {endpoint.formType === 'full' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-6">
                                <InputGroup label="Product">
                                    <select
                                        value={fullForm.product_id}
                                        onChange={e => setFullForm({ ...fullForm, product_id: e.target.value })}
                                        className="clean-input w-full p-2.5 rounded-lg text-sm"
                                        aria-label="Product"
                                        title="Product"
                                    >
                                        <option value="LAPTOP-001">Pro Laptop 15&quot;</option>
                                        <option value="PHONE-001">Smart Phone X</option>
                                        <option value="HEADPHONES-001">Wireless Headphones</option>
                                    </select>
                                </InputGroup>

                                <InputGroup label="Quantity">
                                    <input
                                        type="number"
                                        min="1"
                                        value={fullForm.quantity}
                                        onChange={e => setFullForm({ ...fullForm, quantity: Number(e.target.value) })}
                                        className="clean-input w-full p-2.5 rounded-lg text-sm"
                                        placeholder="Enter quantity"
                                        title="Quantity"
                                    />
                                </InputGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <InputGroup label="User Type">
                                    <select
                                        value={fullForm.user_type}
                                        onChange={e => setFullForm({ ...fullForm, user_type: e.target.value })}
                                        className="clean-input w-full p-2.5 rounded-lg text-sm"
                                        title="User Type"
                                    >
                                        <option value="premium">Premium</option>
                                        <option value="standard">Standard</option>
                                        <option value="guest">Guest</option>
                                    </select>
                                </InputGroup>

                                <InputGroup label="Promo Code">
                                    <input
                                        type="text"
                                        placeholder="e.g. SAVE10"
                                        value={fullForm.promo_code}
                                        onChange={e => setFullForm({ ...fullForm, promo_code: e.target.value })}
                                        className="clean-input w-full p-2.5 rounded-lg text-sm"
                                    />
                                </InputGroup>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-[#e2e8f0]">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${fullForm.express_shipping ? 'bg-[#377dff] border-[#377dff]' : 'border-gray-300 bg-white'}`}>
                                        {fullForm.express_shipping && <Truck className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={fullForm.express_shipping}
                                        onChange={e => setFullForm({ ...fullForm, express_shipping: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-gray-700">Enable Express Shipping</span>
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {endpoint.formType === 'resume' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <InputGroup label="Target Domain">
                                <select
                                    value={resumeForm.domain}
                                    onChange={e => setResumeForm({ ...resumeForm, domain: e.target.value })}
                                    className="clean-input w-full p-2.5 rounded-lg text-sm"
                                >
                                    <option value="backend">Backend Engineering</option>
                                    <option value="frontend">Frontend Engineering</option>
                                    <option value="fullstack">Fullstack Engineering</option>
                                    <option value="data_science">Data Science</option>
                                    <option value="devops">DevOps</option>
                                </select>
                            </InputGroup>

                            <InputGroup label="Min Experience (Years)">
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                    value={resumeForm.min_experience}
                                    onChange={e => setResumeForm({ ...resumeForm, min_experience: Number(e.target.value) })}
                                    className="clean-input w-full p-2.5 rounded-lg text-sm"
                                />
                            </InputGroup>

                            <InputGroup label="Salary Budget ($)">
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={resumeForm.salary_budget}
                                    onChange={e => setResumeForm({ ...resumeForm, salary_budget: Number(e.target.value) })}
                                    className="clean-input w-full p-2.5 rounded-lg text-sm"
                                />
                            </InputGroup>

                            <InputGroup label="Candidate Data File">
                                <input
                                    type="file"
                                    accept=".json,.txt"
                                    onChange={e => setResumeFile(e.target.files ? e.target.files[0] : null)}
                                    className="clean-input w-full p-2.5 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <span className="text-[10px] text-gray-400">Supports JSON or Text files with candidate details</span>
                            </InputGroup>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-700 leading-relaxed">
                                    <p className="font-bold mb-1">Pipeline Simulation</p>
                                    Only the best candidates out of all applicants will be returned based on the JD requirements.
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={clsx(
                                "w-full rounded-xl py-3.5 flex items-center justify-center gap-2 btn-primary",
                                isLoading ? "opacity-70 cursor-not-allowed" : ""
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <RotateCw className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>EXECUTE RUN</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="p-4 text-center text-[10px] text-gray-300 font-mono uppercase tracking-widest">
                Secured by ExplainX™
            </div>


        </div>
    );
}

function InputGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                {label}
            </label>
            {children}
        </div>
    );
}
