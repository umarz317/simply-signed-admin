"use client";

import { buildAuthHeaders, handleUnauthorized } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignInSuccess {
  token: string;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    isAdmin?: boolean;
  };
}

type SignInResponse = {
  token?: string;
  user?: SignInSuccess['user'];
  message?: string;
  error?: string;
};

export async function signIn(credentials: SignInCredentials): Promise<SignInSuccess> {
  const res = await fetch(`${API_URL}/api/auth/signIn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  const data = (await res.json().catch(() => null)) as SignInResponse | null;

  if (!res.ok || !data?.token) {
    const message = data?.message ?? data?.error ?? 'Failed to sign in';
    throw new Error(message);
  }

  return {
    token: data.token,
    user: data.user,
  };
}

export async function authorizedFetch(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: buildAuthHeaders(init?.headers ?? {}),
  });

  if (response.status === 401 || response.status === 403) {
    handleUnauthorized();
  }

  return response;
}

export interface Stage {
  _id: string;
  name: string;
  thumbnail?: string | null;
  colorCodes?: {
    bg: string;
    path: string;
    dottedPath: string;
  };
  pathAssets?: Record<string, string[]>;
}

export interface Category {
  _id: string;
  name: string;
  thumbnail?: string | null;
  colorCodes?: {
    bg: string;
    path: string;
    dottedPath: string;
  };
  stage: string;
  pathData?: Record<string, Record<string, string[]>>;
}

export interface Resource {
  _id: string;
  name: string;
  type: 'learning' | 'avatar' | 'ui' | 'huggy' | 'prebuildAvatar';
  url?: string;
  thumbnail?: string;
  category?: string;
  order?: number;
}

// Stages API
export async function getStages(): Promise<Stage[]> {
  const res = await authorizedFetch(`${API_URL}/api/data/getAllStages`);
  if (!res.ok) {
    throw new Error('Failed to fetch stages');
  }
  const json = await res.json();
  return json.data || json;
}

export async function getStage(id: string): Promise<Stage> {
  const res = await authorizedFetch(`${API_URL}/api/data/getStageById/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch stage');
  }
  return res.json();
}

// Categories API
export async function getCategoriesByStage(stageId: string): Promise<Category[]> {
  const res = await authorizedFetch(`${API_URL}/api/data/getAllDataByStageId/${stageId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  const json = await res.json();
  const payload = json?.data ?? json;

  if (Array.isArray(payload)) {
    return payload as Category[];
  }

  if (payload && typeof payload === 'object') {
    const categories = (payload as { categories?: unknown }).categories;
    if (Array.isArray(categories)) {
      return categories as Category[];
    }
  }

  return [];
}

// Resources API
export async function getResourcesByCategory(categoryId: string): Promise<Resource[]> {
  const res = await authorizedFetch(`${API_URL}/api/data/getAllDataByCategoryId/${categoryId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch resources');
  }
  const json = await res.json();
  const data = json.data || json;
  // API returns { category: {...}, resources: [...] }
  return data.resources || data;
}

export async function getResource(id: string): Promise<Resource> {
  const res = await authorizedFetch(`${API_URL}/api/data/getResourceById/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch resource');
  }
  const json = await res.json();
  return json.data || json;
}

export async function getAllAvatars(): Promise<Resource[]> {
  const res = await authorizedFetch(`${API_URL}/api/data/getAllAvatars`);
  if (!res.ok) {
    throw new Error('Failed to fetch avatars');
  }
  const json = await res.json();
  const data = json.data || json;

  // The API returns {Boy: {category: [resources]}, Girl: {category: [resources]}}
  // Flatten this into a single array
  const flattenedResources: Resource[] = [];
  if (typeof data === 'object' && !Array.isArray(data)) {
    Object.values(data as Record<string, Record<string, Resource[]>>).forEach((gender) => {
      Object.values(gender).forEach((resources) => {
        if (Array.isArray(resources)) {
          flattenedResources.push(...resources);
        }
      });
    });
    return flattenedResources;
  }

  return data;
}

export async function getAllHuggies(): Promise<Resource[]> {
  const res = await authorizedFetch(`${API_URL}/api/data/getAllHuggies`);
  if (!res.ok) {
    throw new Error('Failed to fetch huggies');
  }
  const json = await res.json();
  return json.data || json;
}

export async function getAllPrebuildAvatars(): Promise<Resource[]> {
  const res = await authorizedFetch(`${API_URL}/api/data/getAllPrebuildAvatars`);
  if (!res.ok) {
    throw new Error('Failed to fetch prebuild avatars');
  }
  const json = await res.json();
  return json.data || json;
}

// Stats API
export type StatsResponse = Record<string, unknown>;

export async function getStats(): Promise<StatsResponse> {
  const res = await authorizedFetch(`${API_URL}/api/data/getStats`);
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  const json = await res.json();
  const payload = json?.data ?? json;
  return (payload ?? {}) as StatsResponse;
}
