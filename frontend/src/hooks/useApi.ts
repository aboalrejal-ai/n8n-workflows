import { useState, useEffect, useCallback } from 'react';
import type { SearchResponse, StatsResponse, WorkflowDetail } from '../types';

// The base URL for the API. In development, Vite proxies this to localhost:8000.
// In production, it will be the same origin.
const API_BASE = '/api';

export function useStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.categories) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

export function useWorkflows(query: string, category: string, page: number, perPage: number = 24) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/workflows?page=${page}&per_page=${perPage}&q=${encodeURIComponent(query)}`;
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch workflows');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, category, page, perPage]);

  useEffect(() => {
    // Add debounce for search query
    const timeout = setTimeout(() => {
      fetchWorkflows();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchWorkflows]);

  return { data, loading, error, refetch: fetchWorkflows };
}

export function useWorkflowDetail(filename: string) {
  const [detail, setDetail] = useState<WorkflowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filename) return;
    
    setLoading(true);
    fetch(`${API_BASE}/workflows/${encodeURIComponent(filename)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load workflow details');
        return res.json();
      })
      .then((data) => {
        setDetail(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filename]);

  return { detail, loading, error };
}
