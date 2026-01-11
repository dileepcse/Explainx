import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, FileJson, Activity, Lightbulb, Download, Copy, Play, Clock, Code, ArrowRight, MessageSquare, Send, X } from 'lucide-react';
import { Trace, ApiResponse } from '@/lib/types';
import { clsx } from 'clsx';

interface ResponsePanelProps {
    data: ApiResponse | null;
    status: { code: number; time: number } | null;
}

export default function ResponsePanel({ data, status }: ResponsePanelProps) {
    const [activeTab, setActiveTab] = useState<'traces' | 'result' | 'explain'>('traces');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const handleDownload = () => {
        if (!data?.explain_text) return;
        const blob = new Blob([data.explain_text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'explainX-report.txt';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleChat = async () => {
        if (!input.trim() || !data?.explain_text) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatLoading(true);

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_text: data.explain_text,
                    query: userMsg
                })
            });
            const json = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: json.response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', content: "Failed to connect to AI server." }]);
        } finally {
            setChatLoading(false);
        }
    };

    if (!data) return null;

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-white">
                <div className="flex bg-[#f1f5f9] p-1 rounded-lg border border-[#e2e8f0]">
                    <TabButton
                        active={activeTab === 'traces'}
                        onClick={() => setActiveTab('traces')}
                        icon={<Activity className="w-4 h-4" />}
                        label="Traces"
                        count={data.traces?.length}
                    />
                    <TabButton
                        active={activeTab === 'result'}
                        onClick={() => setActiveTab('result')}
                        icon={<FileJson className="w-4 h-4" />}
                        label="Response"
                    />
                    <TabButton
                        active={activeTab === 'explain'}
                        onClick={() => setActiveTab('explain')}
                        icon={<Lightbulb className="w-4 h-4" />}
                        label="Insights"
                    />
                </div>

                {status && (
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status</span>
                            <span className={clsx(
                                "text-sm font-bold font-mono",
                                status.code < 300 ? "text-[#00c9a7]" : "text-red-500"
                            )}>{status.code} OK</span>
                        </div>
                        <div className="w-px h-8 bg-[#e2e8f0]"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Time</span>
                            <span className="text-sm font-bold text-[#1e2022] font-mono">{status.time.toFixed(0)}ms</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'traces' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 mb-6 px-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Request Timeline</span>
                                <div className="h-px bg-[#e2e8f0] flex-1"></div>
                            </div>

                            {data.traces?.map((trace, idx) => (
                                <TraceCard key={idx} trace={trace} index={idx} isLast={idx === data.traces.length - 1} />
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'result' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="clean-card overflow-hidden"
                        >
                            <div className="bg-[#f8f9fa] px-4 py-2 border-b border-[#e2e8f0] flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-500">response.json</span>
                                <Copy className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[#377dff] transition-colors" />
                            </div>
                            <div className="p-6 overflow-x-auto bg-white">
                                <JsonViewer data={data.result || data} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'explain' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="h-full"
                        >
                            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm relative overflow-hidden flex flex-col h-full">
                                {/* Header Toggle */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-white z-10">
                                    <h3 className="text-lg font-bold text-[#1e2022] flex items-center gap-3">
                                        <span className="p-2 bg-[#ebf2ff] rounded-lg">
                                            {showChat ? <MessageSquare className="w-5 h-5 text-[#377dff]" /> : <Activity className="w-5 h-5 text-[#377dff]" />}
                                        </span>
                                        {showChat ? "AI Assistant" : "AI Execution Analysis"}
                                    </h3>
                                    <button
                                        onClick={() => setShowChat(!showChat)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fa] hover:bg-[#ebf2ff] text-[#377dff] rounded-lg border border-[#e2e8f0] transition-colors text-xs font-medium"
                                    >
                                        {showChat ? <><FileJson className="w-3 h-3" /> View Report</> : <><MessageSquare className="w-3 h-3" /> Ask AI</>}
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
                                    {!showChat ? (
                                        <>
                                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                                <Lightbulb className="w-24 h-24 text-[#377dff]" />
                                            </div>
                                            <div className="prose max-w-none">
                                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                                    {data.explain_text}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col h-full">
                                            {messages.length === 0 && (
                                                <div className="flex flex-col items-center justify-center flex-1 text-center text-gray-400 opacity-60">
                                                    <MessageSquare className="w-12 h-12 mb-2" />
                                                    <p className="text-sm">Ask any question about the execution report</p>
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-4 mb-4">
                                                {messages.map((msg, idx) => (
                                                    <div key={idx} className={clsx(
                                                        "flex w-full",
                                                        msg.role === 'user' ? "justify-end" : "justify-start"
                                                    )}>
                                                        <div className={clsx(
                                                            "max-w-[80%] p-3 rounded-lg text-sm",
                                                            msg.role === 'user'
                                                                ? "bg-[#377dff] text-white rounded-br-none"
                                                                : "bg-[#f1f5f9] text-[#1e2022] rounded-bl-none"
                                                        )}>
                                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {chatLoading && (
                                                    <div className="flex justify-start">
                                                        <div className="bg-[#f1f5f9] p-3 rounded-lg rounded-bl-none flex gap-1">
                                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-4 pb-4 border-t border-[#e2e8f0]">
                                                <input
                                                    type="text"
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                                    placeholder="Ask about the traces, logic, or output..."
                                                    className="flex-1 px-4 py-2 bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#377dff]/20"
                                                />
                                                <button
                                                    onClick={handleChat}
                                                    disabled={chatLoading || !input.trim()}
                                                    className="p-2 bg-[#377dff] text-white rounded-lg hover:bg-[#2f6ad9] disabled:opacity-50 transition-colors"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!showChat && (
                                    <div className="p-4 border-t border-[#e2e8f0] bg-white flex justify-end">
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-[#f8f9fa] rounded-lg border border-[#e2e8f0] transition-all font-medium text-xs text-[#377dff] shadow-sm"
                                        >
                                            <Download className="w-4 h-4" /> Export Report
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label, count }: any) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all relative overflow-hidden",
                active
                    ? "text-[#1e2022] shadow-sm bg-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
            )}
        >
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-md shadow-sm border border-[#e2e8f0] opacity-100"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">
                {icon}
                {label}
                {count !== undefined && (
                    <span className="bg-[#f1f5f9] px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-500">{count}</span>
                )}
            </span>
        </button>
    );
}


function TraceCard({ trace, index, isLast }: { trace: Trace; index: number; isLast: boolean }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="relative pl-8">
            {/* Timeline Line */}
            {!isLast && (
                <div className="absolute left-[15px] top-[40px] bottom-[-20px] w-[2px] bg-[#e2e8f0]"></div>
            )}

            {/* Timeline Dot */}
            <div className={clsx(
                "absolute left-0 top-[12px] w-[30px] h-[30px] rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm",
                "bg-[#ebf2ff] text-[#377dff] font-bold text-[12px]"
            )}>
                {index + 1}
            </div>

            <motion.div
                layout
                onClick={() => setExpanded(!expanded)}
                className={clsx(
                    "clean-card rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden group",
                    expanded ? "ring-2 ring-[#377dff] ring-offset-2" : "hover:border-[#377dff]/50"
                )}
            >
                <div className="p-4 flex items-center justify-between bg-white">
                    <div className="flex flex-col">
                        <h4 className="flex items-center gap-2 font-mono text-sm font-bold text-[#1e2022] group-hover:text-[#377dff] transition-colors">
                            {trace.function}()
                            {trace.explanation && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                            <FileJson className="w-3 h-3" />
                            {trace.file.split(/[/\\]/).pop()}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f8f9fa] rounded-full border border-[#e2e8f0]">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-mono text-gray-600">{trace.duration_ms?.toFixed(2)}ms</span>
                        </div>
                        <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </motion.div>
                    </div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-[#e2e8f0] bg-[#f8f9fa]"
                        >
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2">
                                        <ArrowRight className="w-3 h-3" /> Input
                                    </span>
                                    <div className="bg-white rounded-lg p-3 border border-[#e2e8f0] font-mono text-[11px] overflow-auto max-h-40 custom-scrollbar shadow-inner text-gray-600">
                                        <JsonViewer data={trace.inputs} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2">
                                        <ArrowRight className="w-3 h-3 text-[#00c9a7]" /> Output
                                    </span>
                                    <div className="bg-white rounded-lg p-3 border border-[#e2e8f0] font-mono text-[11px] overflow-auto max-h-40 custom-scrollbar shadow-inner text-gray-600">
                                        <JsonViewer data={trace.output} />
                                    </div>
                                </div>
                                {trace.explanation && (
                                    <div className="col-span-2 mt-2 p-3 rounded-lg bg-yellow-50 border border-yellow-100 flex items-start gap-3">
                                        <Lightbulb className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-yellow-800 leading-relaxed font-sans">{trace.explanation}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function JsonViewer({ data }: { data: any }) {
    const jsonStr = JSON.stringify(data, null, 2);
    const highlighted = jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
    });

    return (
        <pre dangerouslySetInnerHTML={{ __html: highlighted }} className="text-[#1e2022]" />
    );
}
