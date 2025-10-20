'use client';

import { useState, useEffect } from 'react';
import { getStages, Stage } from '@/lib/api';

export default function StagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStages();
  }, []);

  async function loadStages() {
    try {
      setLoading(true);
      const data = await getStages();
      setStages(data);
      setError(null);
    } catch (err) {
      setError('Failed to load stages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading stages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stages</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color Codes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stages.map((stage) => (
              <tr key={stage._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stage.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {stage._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stage.colorCodes ? (
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: stage.colorCodes.bg }}
                        />
                        <span className="text-xs">{stage.colorCodes.bg}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No colors</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a
                    href={`/categories?stage=${stage._id}`}
                    className="text-[#00baff] hover:text-[#0099cc] mr-4"
                  >
                    View Categories
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No stages found</p>
        </div>
      )}
    </div>
  );
}
