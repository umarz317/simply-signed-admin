'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getResourcesByCategory,
  getAllAvatars,
  getAllPrebuildAvatars,
  Resource,
  getStages,
  getCategoriesByStage,
  Stage,
  Category
} from '@/lib/api';
import { EmptyRow, Spinner, TableSkeleton } from '@/app/components/LoadingIndicators';

type ViewMode = 'category' | 'avatars' | 'prebuild';

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get('category');

  const [viewMode, setViewMode] = useState<ViewMode>(categoryIdParam ? 'category' : 'avatars');
  const [categoryId, setCategoryId] = useState<string>(categoryIdParam || '');
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [stagesLoading, setStagesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [viewMediaModal, setViewMediaModal] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [stageSearchTerm, setStageSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  const loadStages = useCallback(async () => {
    try {
      setStagesLoading(true);
      const data = await getStages();
      setStages(data);

      if (data.length > 0) {
        setSelectedStage((current) => {
          if (current && data.some((stage) => stage._id === current)) {
            return current;
          }
          return data[0]._id;
        });
      } else {
        setSelectedStage('');
        setCategories([]);
        setCategoryId('');
        setResources([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStagesLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async (stageId: string) => {
    try {
      setCategoriesLoading(true);
      const categoryList = await getCategoriesByStage(stageId);
      setCategories(categoryList);
      setCategorySearchTerm('');

      if (categoryList.length > 0) {
        setCategoryId((current) => {
          if (current && categoryList.some((category) => category._id === current)) {
            return current;
          }
          return categoryList[0]._id;
        });
      } else {
        setCategoryId('');
        setResources([]);
        setResourcesLoading(false);
      }
    } catch (err) {
      console.error(err);
      setCategories([]);
      setCategoryId('');
      setResources([]);
      setResourcesLoading(false);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadResources = useCallback(async () => {
    try {
      if (viewMode === 'category' && !categoryId) {
        setResources([]);
        setResourcesLoading(false);
        return;
      }

      setResourcesLoading(true);
      let data: Resource[] = [];

      switch (viewMode) {
        case 'category':
          if (categoryId) {
            data = await getResourcesByCategory(categoryId);
          }
          break;
        case 'avatars':
          data = await getAllAvatars();
          break;
        case 'prebuild':
          data = await getAllPrebuildAvatars();
          break;
      }
      setResources(data);
      setError(null);
    } catch (err) {
      setError('Failed to load resources');
      console.error(err);
    } finally {
      setResourcesLoading(false);
    }
  }, [categoryId, viewMode]);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  useEffect(() => {
    if (selectedStage) {
      loadCategories(selectedStage);
    }
  }, [selectedStage, loadCategories]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    if (viewMode !== 'category') {
      setStageSearchTerm('');
      setCategorySearchTerm('');
    }
  }, [viewMode]);

  const hasStageSelection = Boolean(selectedStage);
  const hasCategorySelection = Boolean(categoryId);
  const hasOrderColumn = viewMode === 'category';

  const resourcesEmptyMessage = (() => {
    if (viewMode === 'category') {
      if (!hasStageSelection) {
        return 'Select a stage to browse learning resources.';
      }
      if (!hasCategorySelection) {
        return 'Select a category to view its learning resources.';
      }
      return 'No learning resources found for this category yet.';
    }

    switch (viewMode) {
      case 'avatars':
        return 'No avatars are available at the moment.';
      case 'prebuild':
        return 'No prebuild avatars are available yet.';
      default:
        return 'No resources found.';
    }
  })();

  const filteredStages = useMemo(() => {
    if (!stageSearchTerm.trim()) {
      return stages;
    }
    const query = stageSearchTerm.toLowerCase();
    return stages.filter((stage) => `${stage.name} ${stage._id}`.toLowerCase().includes(query));
  }, [stageSearchTerm, stages]);

  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm.trim()) {
      return categories;
    }
    const query = categorySearchTerm.toLowerCase();
    return categories.filter((category) => `${category.name} ${category._id}`.toLowerCase().includes(query));
  }, [categorySearchTerm, categories]);

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={() => { setViewMode('category'); }}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewMode === 'category'
                ? 'bg-[#00baff] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Learning
          </button>
          <button
            onClick={() => setViewMode('avatars')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewMode === 'avatars'
                ? 'bg-[#00baff] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Avatars
          </button>
          <button
            onClick={() => setViewMode('prebuild')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewMode === 'prebuild'
                ? 'bg-[#00baff] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Prebuild
          </button>
        </div>
      </div>

      {viewMode === 'category' && (
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Stage
                {stagesLoading && <Spinner className="h-4 w-4 text-[#00baff]" />}
              </div>
              <div className="relative w-40">
                <input
                  type="text"
                  placeholder="Search stages"
                  value={stageSearchTerm}
                  onChange={(event) => setStageSearchTerm(event.target.value)}
                  disabled={stagesLoading || stages.length === 0}
                  className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-[#00baff] focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                {stageSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setStageSearchTerm('')}
                    className="absolute inset-y-0 right-2 flex items-center text-xs text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {stagesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-10 rounded-md bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredStages.length > 0 ? (
                filteredStages.map((stage) => {
                  const isSelected = stage._id === selectedStage;
                  return (
                    <button
                      key={stage._id}
                      type="button"
                      onClick={() => {
                        if (stage._id !== selectedStage) {
                          setSelectedStage(stage._id);
                          setCategoryId('');
                          setResources([]);
                          setCategorySearchTerm('');
                        }
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? 'border-[#00baff] bg-sky-50 text-[#0099cc] shadow-sm'
                          : 'border-gray-200 hover:border-sky-200 hover:bg-sky-50/40'
                      }`}
                    >
                      <span className="font-medium truncate">{stage.name}</span>
                      <span className="text-xs font-mono text-gray-500">{stage._id}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  {stageSearchTerm
                    ? `No stages match "${stageSearchTerm}".`
                    : 'No stages available yet.'}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Category
                {categoriesLoading && <Spinner className="h-4 w-4 text-[#00baff]" />}
              </div>
              <div className="relative w-40">
                <input
                  type="text"
                  placeholder="Search categories"
                  value={categorySearchTerm}
                  onChange={(event) => setCategorySearchTerm(event.target.value)}
                  disabled={!selectedStage || categoriesLoading || categories.length === 0}
                  className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-[#00baff] focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                {categorySearchTerm && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchTerm('')}
                    className="absolute inset-y-0 right-2 flex items-center text-xs text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {!selectedStage ? (
                <p className="text-sm text-gray-500">Select a stage to view its categories.</p>
              ) : categoriesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-10 rounded-md bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => {
                  const isSelected = category._id === categoryId;
                  return (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => setCategoryId(category._id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? 'border-[#00baff] bg-sky-50 text-[#0099cc] shadow-sm'
                          : 'border-gray-200 hover:border-sky-200 hover:bg-sky-50/40'
                      }`}
                    >
                      <span className="font-medium truncate">{category.name}</span>
                      <span className="text-xs font-mono text-gray-500">{category._id}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  {categorySearchTerm
                    ? `No categories match "${categorySearchTerm}".`
                    : 'No categories available for this stage yet.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {error ? (
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  {viewMode === 'category' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thumbnail
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resourcesLoading ? (
                  <TableSkeleton
                    columns={[
                      {
                        className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900',
                        skeletonClassName: 'h-4 w-40'
                      },
                      {
                        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
                        skeletonClassName: 'h-4 w-24'
                      },
                      {
                        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono',
                        skeletonClassName: 'h-4 w-32'
                      },
                      ...(hasOrderColumn
                        ? [
                            {
                              className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
                              skeletonClassName: 'h-4 w-16'
                            }
                          ]
                        : []),
                      {
                        className: 'px-6 py-4 whitespace-nowrap text-sm',
                        skeletonClassName: 'h-4 w-20'
                      },
                      {
                        className: 'px-6 py-4 whitespace-nowrap text-sm',
                        skeletonClassName: 'h-4 w-20'
                      }
                    ]}
                  />
                ) : resources.length > 0 ? (
                  resources.map((resource) => (
                    <tr key={resource._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resource.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {resource.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {resource._id}
                      </td>
                      {hasOrderColumn && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.order ?? 'N/A'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {resource.url ? (
                          <button
                            onClick={() => {
                              const mediaUrl = resource.url;
                              if (!mediaUrl) return;
                              const type: 'video' | 'image' = mediaUrl.includes('.mp4') || mediaUrl.includes('Videos')
                                ? 'video'
                                : 'image';
                              setMediaLoading(true);
                              setViewMediaModal({ type, url: mediaUrl });
                            }}
                            className="text-[#00baff] hover:text-[#0099cc]"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {resource.thumbnail ? (
                          <button
                            onClick={() => {
                              if (!resource.thumbnail) return;
                              setMediaLoading(true);
                              setViewMediaModal({ type: 'image', url: resource.thumbnail });
                            }}
                            className="text-[#00baff] hover:text-[#0099cc]"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={hasOrderColumn ? 6 : 5} message={resourcesEmptyMessage} />
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Media Viewer Modal */}
      {viewMediaModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {viewMediaModal.type === 'video' ? 'Video Preview' : 'Image Preview'}
              </h3>
              <button
                onClick={() => {
                  setViewMediaModal(null);
                  setMediaLoading(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {mediaLoading && (
                <div className="flex h-[70vh] w-full items-center justify-center">
                  <Spinner className="h-8 w-8 text-[#00baff]" />
                </div>
              )}
              {viewMediaModal.type === 'video' ? (
                <video
                  controls
                  className={`w-full max-h-[70vh] ${mediaLoading ? 'hidden' : ''}`}
                  src={viewMediaModal.url}
                  onLoadedData={() => setMediaLoading(false)}
                  onError={() => setMediaLoading(false)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={viewMediaModal.url}
                  alt="Preview"
                  className={`w-full h-auto max-h-[70vh] object-contain ${mediaLoading ? 'hidden' : ''}`}
                  onLoad={() => setMediaLoading(false)}
                  onError={() => setMediaLoading(false)}
                />
              )}
            </div>
            {viewMediaModal.type !== 'image' && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 break-all">
                  <span className="font-medium">URL:</span> {viewMediaModal.url}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
