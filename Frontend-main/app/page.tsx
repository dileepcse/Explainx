'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import RequestPanel from '@/components/RequestPanel';
import ResponsePanel from '@/components/ResponsePanel';
import { ApiResponse } from '@/lib/types';
import { ENDPOINTS } from '@/components/Sidebar';
import { Sparkles, Zap } from 'lucide-react';

export default function Home() {
  const [currentEndpointId, setCurrentEndpointId] = useState('simple');
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState<ApiResponse | null>(null);
  const [status, setStatus] = useState<{ code: number; time: number } | null>(null);

  const currentEndpoint = ENDPOINTS.find(e => e.id === currentEndpointId) || ENDPOINTS[0];

  const handleExecute = async (body: any) => {
    setIsLoading(true);
    setResponseData(null);
    setStatus(null);
    const startTime = performance.now();

    try {
      const url = `http://localhost:8000${currentEndpoint.path}`;
      const options: RequestInit = {
        method: currentEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (currentEndpoint.method === 'POST') {
        if (body instanceof FormData) {
          options.body = body;
          // Cast to Record<string, string> to allow deletion
          // Remove Content-Type to let browser set boundary for multipart
          const headers = options.headers as Record<string, string>;
          delete headers['Content-Type'];
        } else {
          options.body = JSON.stringify(body);
        }
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const endTime = performance.now();

      setStatus({
        code: res.status,
        time: endTime - startTime
      });
      setResponseData(data);
    } catch (error) {
      console.error(error);
      const endTime = performance.now();
      setStatus({ code: 500, time: endTime - startTime });
      setResponseData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-white selection:bg-[#ebf2ff] selection:text-[#377dff]">
      {/* Background - Very Subtle Gradient */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,#ffffff_0%,#f8f9fa_100%)]"></div>

      {/* Main Content Interface */}
      <div className="relative z-10 flex w-full h-full">
        {/* Sidebar Navigation */}
        <Sidebar
          currentEndpoint={currentEndpointId}
          onSelectEndpoint={(id) => {
            setCurrentEndpointId(id);
            setResponseData(null);
            setStatus(null);
          }}
        />

        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
          {/* Request Panel (Left) */}
          <div className="w-full md:w-5/12 h-full border-r border-blue-100 bg-white">
            <RequestPanel
              endpoint={currentEndpoint}
              onExecute={handleExecute}
              isLoading={isLoading}
            />
          </div>

          {/* Response Panel (Right) */}
          <div className="w-full md:w-7/12 h-full bg-blue-50">
            {responseData ? (
              <ResponsePanel data={responseData} status={status} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-200/40 blur-xl rounded-full"></div>
                  <div className="relative bg-white p-6 rounded-2xl border border-blue-100 shadow-2xl">
                    <Zap className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-blue-900 tracking-tight">Ready to Run</h3>
                  <p className="text-blue-500 max-w-sm">
                    Select an endpoint and hit <span className="text-blue-600 font-semibold">Execute</span> to trace the magic.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-100 px-4 py-2 rounded-full border border-blue-200">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span>Powered by ExplainX Engine</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
