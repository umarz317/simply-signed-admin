'use client';

import { useState, useEffect } from 'react';
import { getStats } from '@/lib/api';
import { Spinner } from '@/app/components/LoadingIndicators';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

type DistributionBucket = {
  _id: string;
  count: number;
};

type ProgressStats = {
  avgProgressPerUser?: number;
  totalProgress?: number;
};

type Stats = {
  totalUsers: number;
  totalResources: number;
  genderDistribution?: DistributionBucket[];
  ageDistribution?: DistributionBucket[];
  progressStats?: ProgressStats;
};

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
  const data = (await getStats()) as Stats;
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner className="h-12 w-12 text-[#00baff]" />
        <div className="text-sm font-semibold text-gray-700">Preparing your dashboard</div>
        <p className="text-xs text-gray-500">Fetching the latest learning progress and user insights…</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load dashboard statistics
        </div>
      </div>
    );
  }

  // Prepare gender distribution data
  type ChartDatum = { name: string; value: number; color: string };

  const genderData: ChartDatum[] = (stats.genderDistribution ?? []).map((item: DistributionBucket) => ({
    name: item._id === 'boy' ? 'Boy' : item._id === 'girl' ? 'Girl' : item._id === 'huggy' ? 'Huggy' : 'Unknown',
    value: item.count,
    color: item._id === 'boy' ? '#3b82f6' : item._id === 'girl' ? '#ec4899' : item._id === 'huggy' ? '#8b5cf6' : '#6b7280'
  }));

  // Prepare age distribution data
  const ageData: ChartDatum[] = (stats.ageDistribution ?? [])
    .filter((item: DistributionBucket) => item._id) // Filter out null ages
    .map((item: DistributionBucket) => ({
      name: `Age ${item._id}`,
      value: item.count,
      color: '#06b6d4' // cyan-500 from logo
    }));

  const avgProgressValue = stats.progressStats?.avgProgressPerUser ?? 0;
  const avgProgress = avgProgressValue.toFixed(1);
  const completionRate = stats.totalResources > 0
    ? ((avgProgressValue / stats.totalResources) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Simply Signed Dashboard
        </h2>
        <p className="text-lg text-gray-600">
          Overview of your educational content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-50 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Avg Progress</p>
              <p className="text-3xl font-bold mt-2">{avgProgress}</p>
              <p className="text-green-200 text-xs mt-1">resources per user</p>
            </div>
            <div className="bg-green-400 bg-opacity-50 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold mt-2">{completionRate}%</p>
              <p className="text-cyan-200 text-xs mt-1">average</p>
            </div>
            <div className="bg-cyan-400 bg-opacity-50 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Total Progress</p>
              <p className="text-3xl font-bold mt-2">{stats.progressStats?.totalProgress || 0}</p>
              <p className="text-yellow-200 text-xs mt-1">resources unlocked</p>
            </div>
            <div className="bg-yellow-400 bg-opacity-50 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Charts */}
        <div className="space-y-8">
          {/* Gender Distribution Pie Chart */}
          {genderData.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: PieLabelRenderProps) => {
                      const name = props.name ?? 'Unknown';
                      const percent = typeof props.percent === 'number' ? props.percent : 0;
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Age Distribution Bar Chart */}
          {ageData.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Age Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Empty state if no data */}
          {genderData.length === 0 && ageData.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No user data available yet</p>
              <p className="text-gray-400 text-sm mt-2">Charts will appear once users start signing up</p>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/stages"
              className="block p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all group"
            >
              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">Manage Stages</h4>
              <p className="text-gray-600 text-sm mt-1">View and edit learning stages</p>
            </a>
            <a
              href="/categories"
              className="block p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group"
            >
              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">Manage Categories</h4>
              <p className="text-gray-600 text-sm mt-1">Organize content categories</p>
            </a>
            <a
              href="/resources"
              className="block p-4 border-2 border-cyan-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition-all group"
            >
              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-600">Manage Resources</h4>
              <p className="text-gray-600 text-sm mt-1">Update learning materials</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
