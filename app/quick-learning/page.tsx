"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAllQuickLearning,
  Category,
  Resource,
  authorizedFetch,
  QuickLearningData,
} from "@/lib/api";
import {
  EmptyRow,
  Spinner,
  TableSkeleton,
} from "@/app/components/LoadingIndicators";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type CategorySelectorProps = {
  categories: Category[];
  selectedCategoryId: string;
  loading: boolean;
  onSelect: (categoryId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  className?: string;
  emptyMessage?: string;
};

const CategorySelector = ({
  categories,
  selectedCategoryId,
  loading,
  onSelect,
  searchTerm,
  onSearchChange,
  className,
  emptyMessage = "No categories available yet.",
}: CategorySelectorProps) => {
  const containerClassName = ["space-y-3", className].filter(Boolean).join(" ");
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const query = searchTerm.toLowerCase();
    return categories.filter((category) =>
      `${category.name} ${category._id}`.toLowerCase().includes(query)
    );
  }, [categories, searchTerm]);

  return (
    <div className={containerClassName}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Category</span>
          {loading && <Spinner className="h-4 w-4 text-indigo-600" />}
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search categories…"
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            disabled={loading && categories.length === 0}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Clear search</span>×
            </button>
          )}
        </div>
      </div>

      {loading && categories.length === 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCategories.map((category) => {
            const isSelected = category._id === selectedCategoryId;
            const backgroundColor = category.colorCodes?.bg || "#e5e7eb";

            return (
              <button
                key={category._id}
                type="button"
                onClick={() => onSelect(category._id)}
                className={`rounded-lg border bg-white p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-200"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-200"
                    style={{ backgroundColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {category.name}
                    </p>
                    <p className="truncate text-xs text-gray-500 font-mono">
                      {category._id}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-xs font-medium text-indigo-600">
                      Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          <span>
            {searchTerm ? `No categories match "${searchTerm}".` : emptyMessage}
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

type Tab = "categories" | "resources";

type QuickAction = {
  label: string;
  helper?: string;
  onClick: () => void;
  disabled: boolean;
};

export default function QuickLearningPage() {
  const [activeTab, setActiveTab] = useState<Tab>("categories");
  const [quickLearningData, setQuickLearningData] =
    useState<QuickLearningData | null>(null);
  const [categories, setCategories] = useState<
    (Category & { resources: Resource[] })[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [viewMediaModal, setViewMediaModal] = useState<{
    type: "video" | "thumbnail";
    url: string;
  } | null>(null);

  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [categoryBeingEdited, setCategoryBeingEdited] =
    useState<Category | null>(null);
  const [categoryEditName, setCategoryEditName] = useState("");
  const [categoryEditThumbnailFile, setCategoryEditThumbnailFile] =
    useState<File | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Delete confirmation modals
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    type: "category" | "resource";
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form data
  const [categoryName, setCategoryName] = useState("");
  const [resourceName, setResourceName] = useState("");
  const [resourceOrder, setResourceOrder] = useState<number>(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<
    "idle" | "video" | "thumbnail" | "resource" | "complete"
  >("idle");

  useEffect(() => {
    loadQuickLearning();
  }, []);

  async function loadQuickLearning() {
    try {
      setLoading(true);
      const data = await getAllQuickLearning();
      setQuickLearningData(data);
      setCategories(data.categories || []);
      if (data.categories && data.categories.length > 0) {
        setSelectedCategory((current) => {
          if (current && data.categories.some((cat) => cat._id === current)) {
            return current;
          }
          return data.categories[0]._id;
        });
      } else {
        setSelectedCategory("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!quickLearningData?.stage._id) return;

    try {
      setUploading(true);
      const res = await authorizedFetch(`${API_BASE_URL}/api/upload/category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName,
          stage: quickLearningData.stage._id,
        }),
      });

      if (res.ok) {
        setCategoryName("");
        setShowCategoryModal(false);
        loadQuickLearning();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateResource(e: React.FormEvent) {
    e.preventDefault();
    try {
      setUploading(true);
      setUploadStep("idle");

      const selectedCategoryName =
        categories.find((c) => c._id === selectedCategory)?.name || "";
      const stageName = quickLearningData?.stage.name || "Quick Learning";

      let videoKey = "";
      let thumbnailKey = "";

      // Upload video
      if (videoFile) {
        setUploadStep("video");

        const videoFormData = new FormData();
        videoFormData.append("video", videoFile);
        videoFormData.append("stage", stageName);
        videoFormData.append("category", selectedCategoryName);

        const videoRes = await authorizedFetch(
          `${API_BASE_URL}/api/upload/video`,
          {
            method: "POST",
            body: videoFormData,
          }
        );

        const videoData = await videoRes.json();
        if (!videoRes.ok) {
          throw new Error(videoData.message || "Failed to upload video");
        }
        videoKey = videoData.data.key;
      }

      // Upload thumbnail
      if (thumbnailFile) {
        setUploadStep("thumbnail");

        const thumbnailFormData = new FormData();
        thumbnailFormData.append("thumbnail", thumbnailFile);
        thumbnailFormData.append("stage", stageName);
        thumbnailFormData.append("category", selectedCategoryName);

        const thumbnailRes = await authorizedFetch(
          `${API_BASE_URL}/api/upload/thumbnail`,
          {
            method: "POST",
            body: thumbnailFormData,
          }
        );

        const thumbnailData = await thumbnailRes.json();
        if (!thumbnailRes.ok) {
          throw new Error(
            thumbnailData.message || "Failed to upload thumbnail"
          );
        }
        thumbnailKey = thumbnailData.data.key;
      }

      // Create resource
      setUploadStep("resource");

      const res = await authorizedFetch(`${API_BASE_URL}/api/upload/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resourceName,
          type: "quicklearning",
          category: selectedCategory,
          videoKey,
          thumbnailKey,
          order: resourceOrder,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to create resource");
      }

      setUploadStep("complete");

      setResourceName("");
      setResourceOrder(1);
      setVideoFile(null);
      setThumbnailFile(null);
      setShowResourceModal(false);
      setUploadStep("idle");
      loadQuickLearning();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Error creating resource";
      alert(message);
    } finally {
      setUploading(false);
    }
  }

  function openCategoryEditModal(category: Category) {
    setCategoryBeingEdited(category);
    setCategoryEditName(category.name);
    setCategoryEditThumbnailFile(null);
    setShowCategoryEditModal(true);
  }

  function closeCategoryEditModal() {
    setShowCategoryEditModal(false);
    setCategoryBeingEdited(null);
    setCategoryEditName("");
    setCategoryEditThumbnailFile(null);
  }

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryBeingEdited) return;

    try {
      setSavingCategory(true);

      let thumbnailKey: string | undefined;
      if (categoryEditThumbnailFile) {
        const formData = new FormData();
        formData.append("thumbnail", categoryEditThumbnailFile);

        const response = await authorizedFetch(
          `${API_BASE_URL}/api/upload/categoryThumbnail`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to upload thumbnail");
        }
        thumbnailKey = data.data?.key;
      }

      const payload: Record<string, unknown> = {
        name: categoryEditName,
      };

      if (thumbnailKey) {
        payload.thumbnailKey = thumbnailKey;
      }

      const res = await authorizedFetch(
        `${API_BASE_URL}/api/upload/category/${categoryBeingEdited._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(resData.message || "Failed to update category");
      }

      await loadQuickLearning();
      closeCategoryEditModal();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Error updating category";
      alert(message);
    } finally {
      setSavingCategory(false);
    }
  }

  const getCategoryName = (catId: string) =>
    categories.find((c) => c._id === catId)?.name || "";

  async function confirmDelete() {
    if (!deleteConfirmModal) return;

    try {
      setDeleting(true);
      let res: Response;

      switch (deleteConfirmModal.type) {
        case "category":
          res = await authorizedFetch(
            `${API_BASE_URL}/api/upload/category/${deleteConfirmModal.id}`,
            {
              method: "DELETE",
            }
          );
          break;
        case "resource":
          res = await authorizedFetch(
            `${API_BASE_URL}/api/upload/resource/${deleteConfirmModal.id}`,
            {
              method: "DELETE",
            }
          );
          break;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || `Failed to delete ${deleteConfirmModal.type}`
        );
      }

      await loadQuickLearning();
      setDeleteConfirmModal(null);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : `Error deleting ${deleteConfirmModal.type}`;
      alert(message);
    } finally {
      setDeleting(false);
    }
  }

  const hasCategorySelection = Boolean(selectedCategory);

  const categoriesEmptyMessage =
    "No categories for Quick Learning yet. Create one to organize your resources.";

  const resourcesEmptyMessage = hasCategorySelection
    ? "No quick learning resources found for this category yet."
    : "Select a category to view its resources.";

  const formatCount = (count: number) => count.toLocaleString();
  const selectedCategoryData = categories.find(
    (category) => category._id === selectedCategory
  );
  const currentResources = selectedCategoryData?.resources || [];

  const headerChips = [
    { label: "Total categories", value: formatCount(categories.length) },
    {
      label: selectedCategory ? "Resources in category" : "Resources loaded",
      value: formatCount(currentResources.length),
    },
  ];

  const quickAction: QuickAction | null = (() => {
    if (activeTab === "categories") {
      return {
        label: "New category",
        helper: "Add to Quick Learning",
        onClick: () => setShowCategoryModal(true),
        disabled: loading,
      } as const;
    }
    if (activeTab === "resources") {
      return {
        label: "New resource",
        helper: selectedCategory
          ? `Upload to ${selectedCategoryData?.name ?? "category"}`
          : "Select a category first",
        onClick: () => setShowResourceModal(true),
        disabled: !selectedCategory || loading,
      } as const;
    }
    return null;
  })();

  return (
    <div className="px-4 py-8 sm:px-0">
      <header className="mb-10 space-y-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-gray-900">
              Quick Learning
            </h1>
            <p className="text-sm text-gray-600">
              Manage categories and resources for Quick Learning.
            </p>
            <dl className="flex flex-wrap gap-2 text-xs text-gray-500 sm:text-sm">
              {headerChips.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1"
                >
                  <dt className="font-medium text-gray-500">{label}</dt>
                  <dd className="font-semibold text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {quickAction && (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <button
                type="button"
                onClick={quickAction.onClick}
                disabled={quickAction.disabled}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14m7-7H5"
                  />
                </svg>
                {quickAction.label}
              </button>
              {quickAction.helper && (
                <p className="text-xs text-gray-500">{quickAction.helper}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:text-sm">
            <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1">
              <span className="font-medium text-gray-500">Category</span>
              <span className="font-semibold text-gray-900">
                {selectedCategoryData
                  ? selectedCategoryData.name
                  : "None selected"}
              </span>
            </span>
          </div>
          <nav className="flex rounded-full bg-gray-100 p-1 text-sm font-medium text-gray-500">
            {(["categories", "resources"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-full px-4 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex-none ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "hover:text-gray-700"
                  }`}
                >
                  {tab === "categories" && "Categories"}
                  {tab === "resources" && "Resources"}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
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
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resources
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <TableSkeleton
                    columns={[
                      {
                        className:
                          "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",
                        skeletonClassName: "h-4 w-40",
                      },
                      {
                        className:
                          "px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono",
                        skeletonClassName: "h-4 w-48",
                      },
                      {
                        className: "px-6 py-4 whitespace-nowrap",
                        skeletonClassName: "h-8 w-8",
                      },
                      {
                        className:
                          "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
                        skeletonClassName: "h-4 w-12",
                      },
                      {
                        className:
                          "px-6 py-4 whitespace-nowrap text-right text-sm",
                        skeletonClassName: "h-4 w-16 ml-auto",
                      },
                    ]}
                  />
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {category._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.colorCodes && (
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: category.colorCodes.bg }}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.resources?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => openCategoryEditModal(category)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmModal({
                                type: "category",
                                id: category._id,
                                name: category.name,
                              })
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} message={categoriesEmptyMessage} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          <CategorySelector
            categories={categories}
            selectedCategoryId={selectedCategory}
            loading={loading}
            onSelect={setSelectedCategory}
            searchTerm={categorySearchTerm}
            onSearchChange={setCategorySearchTerm}
            emptyMessage={categoriesEmptyMessage}
          />

          <div className="flex justify-end">
            <button
              onClick={() => setShowResourceModal(true)}
              disabled={!selectedCategory || loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add Resource
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thumbnail
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <TableSkeleton
                    columns={[
                      {
                        className:
                          "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
                        skeletonClassName: "h-4 w-12",
                      },
                      {
                        className:
                          "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",
                        skeletonClassName: "h-4 w-48",
                      },
                      {
                        className: "px-6 py-4 whitespace-nowrap text-sm",
                        skeletonClassName: "h-4 w-24",
                      },
                      {
                        className: "px-6 py-4 whitespace-nowrap text-sm",
                        skeletonClassName: "h-4 w-24",
                      },
                      {
                        className:
                          "px-6 py-4 whitespace-nowrap text-right text-sm",
                        skeletonClassName: "h-4 w-16 ml-auto",
                      },
                    ]}
                  />
                ) : currentResources.length > 0 ? (
                  currentResources.map((resource) => (
                    <tr key={resource._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resource.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {resource.url ? (
                          <button
                            onClick={() => {
                              const mediaUrl = resource.url;
                              if (!mediaUrl) return;
                              setViewMediaModal({
                                type: "video",
                                url: mediaUrl,
                              });
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
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
                              setViewMediaModal({
                                type: "thumbnail",
                                url: resource.thumbnail,
                              });
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() =>
                            setDeleteConfirmModal({
                              type: "resource",
                              id: resource._id,
                              name: resource.name,
                            })
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} message={resourcesEmptyMessage} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {showCategoryEditModal && categoryBeingEdited && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Category
            </h3>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryEditName}
                  onChange={(e) => setCategoryEditName(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replace Thumbnail (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCategoryEditThumbnailFile(e.target.files?.[0] || null)
                  }
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {categoryBeingEdited.thumbnail && (
                  <div className="mt-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={categoryBeingEdited.thumbnail}
                      alt={`${categoryBeingEdited.name} thumbnail`}
                      className="h-12 w-12 rounded object-cover border border-gray-200"
                    />
                    <span className="text-xs text-gray-500 break-all">
                      {categoryBeingEdited.thumbnail}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeCategoryEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingCategory ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New Category
            </h3>
            <form onSubmit={handleCreateCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {uploading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New Quick Learning Resource
            </h3>
            <form onSubmit={handleCreateResource}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Name
                </label>
                <input
                  type="text"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  disabled={uploading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={resourceOrder}
                  onChange={(e) =>
                    setResourceOrder(parseInt(e.target.value) || 1)
                  }
                  min="1"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  disabled={uploading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video File (uploaded to: simply-signed/Videos/
                  {quickLearningData?.stage.name || "Quick Learning"}/
                  {getCategoryName(selectedCategory)})
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                  required
                  disabled={uploading}
                />
                {videoFile && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected: {videoFile.name} (
                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail (uploaded to: simply-signed/Resources/
                  {quickLearningData?.stage.name || "Quick Learning"}/
                  {getCategoryName(selectedCategory)})
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] || null)
                  }
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                  disabled={uploading}
                />
                {thumbnailFile && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected: {thumbnailFile.name} (
                    {(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Upload Status */}
              {uploading && (
                <div className="mb-4 space-y-2 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-900">
                    <Spinner className="h-4 w-4 text-indigo-600" />
                    <span>Uploading resource...</span>
                  </div>

                  <div className="space-y-2 pl-6">
                    {videoFile && (
                      <div className="flex items-center gap-2 text-sm">
                        {uploadStep === "video" ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-indigo-700">
                              Uploading video...
                            </span>
                          </>
                        ) : uploadStep === "thumbnail" ||
                          uploadStep === "resource" ||
                          uploadStep === "complete" ? (
                          <>
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-green-700">
                              Video uploaded
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span className="text-gray-500">Video pending</span>
                          </>
                        )}
                      </div>
                    )}

                    {thumbnailFile && (
                      <div className="flex items-center gap-2 text-sm">
                        {uploadStep === "thumbnail" ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-indigo-700">
                              Uploading thumbnail...
                            </span>
                          </>
                        ) : uploadStep === "resource" ||
                          uploadStep === "complete" ? (
                          <>
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-green-700">
                              Thumbnail uploaded
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span className="text-gray-500">
                              Thumbnail pending
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      {uploadStep === "resource" ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                          <span className="text-indigo-700">
                            Creating resource...
                          </span>
                        </>
                      ) : uploadStep === "complete" ? (
                        <>
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-green-700">
                            Resource created
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span className="text-gray-500">
                            Resource pending
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!uploading) {
                      setShowResourceModal(false);
                      setResourceName("");
                      setResourceOrder(1);
                      setVideoFile(null);
                      setThumbnailFile(null);
                      setUploadStep("idle");
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading && <Spinner className="h-4 w-4 text-white" />}
                  {uploading ? "Uploading..." : "Create Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      {viewMediaModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {viewMediaModal.type === "video"
                  ? "Video Preview"
                  : "Thumbnail Preview"}
              </h3>
              <button
                onClick={() => setViewMediaModal(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {viewMediaModal.type === "video" ? (
                <video
                  controls
                  className="w-full max-h-[70vh]"
                  src={viewMediaModal.url}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={viewMediaModal.url}
                  alt="Thumbnail"
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600 break-all">
                <span className="font-medium">URL:</span> {viewMediaModal.url}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete {deleteConfirmModal.type}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">
                    {deleteConfirmModal.name}
                  </span>
                  ?
                  {deleteConfirmModal.type === "category" && (
                    <span className="block mt-1 text-red-600">
                      Note: The category must have no resources.
                    </span>
                  )}
                  {deleteConfirmModal.type === "resource" && (
                    <span className="block mt-1 text-gray-500">
                      This action cannot be undone.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting && <Spinner className="h-4 w-4 text-white" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
