'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCategoriesByStage, getStages, Stage, Category } from '@/lib/api';

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const stageIdParam = searchParams.get('stage');

  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>(stageIdParam || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadStages = useCallback(async () => {
    try {
      const data = await getStages();
      setStages(data);
      if (data.length > 0) {
        setSelectedStage((current) => {
          if (current) {
            return current;
          }
          return data[0]._id;
        });
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadCategories = useCallback(async (stageId: string) => {
    try {
      setLoading(true);
      const data = await getCategoriesByStage(stageId);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStages();
  }, [loadStages]);

  useEffect(() => {
    if (selectedStage) {
      void loadCategories(selectedStage);
    }
  }, [selectedStage, loadCategories]);

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <div className="mt-4 sm:mt-0">
          <label htmlFor="stage" className="sr-only">
            Select Stage
          </label>
          <select
            id="stage"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {stages.map((stage) => (
              <option key={stage._id} value={stage._id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading categories...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
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
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {category._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.colorCodes ? (
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: category.colorCodes.bg }}
                            />
                            <span className="text-xs">{category.colorCodes.bg}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No colors</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={`/resources?category=${category._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Resources
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No categories found for this stage</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
