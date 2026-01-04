'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Loader2, FileText, Calendar, Eye } from 'lucide-react';

interface Document {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  category: string;
  created_at: string;
  updated_at: string;
  view_count: number;
}

export default function DatabaseDocsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, filter]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const statusParam = filter === 'all' ? '' : `?status=${filter}`;
      const response = await fetch(`/api/documents${statusParam}`);

      if (!response.ok) {
        throw new Error('获取文档列表失败');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('获取文档失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                文档列表
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                所有内容都存储在数据库中
              </p>
            </div>
            <Link
              href="/database-docs/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              创建新文档
            </Link>
          </div>
        </div>
      </div>

      {/* 过滤器 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'published'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            已发布
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'draft'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            草稿
          </button>
        </div>
      </div>

      {/* 文档列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无文档
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filter === 'all' ? '还没有创建任何文档' : `没有${filter === 'published' ? '已发布' : '草稿'}状态的文档`}
            </p>
            <Link
              href="/database-docs/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              创建第一个文档
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/database-docs/${doc.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {doc.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        doc.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {doc.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {doc.description || '暂无描述'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(doc.created_at).toLocaleDateString('zh-CN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {doc.view_count}
                      </div>
                      <span>分类: {doc.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/database-docs/${doc.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      编辑
                    </Link>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
