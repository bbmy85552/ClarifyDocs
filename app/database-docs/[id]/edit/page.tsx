'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MdxEditor } from '@/components/editor/mdx-editor-with-highlight';
import { MetadataForm } from '@/components/editor/metadata-form';
import { Save, Eye, Loader2, Trash2 } from 'lucide-react';

export default function EditDocumentPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    slug: '',
    category: 'general',
    tags: [],
    status: 'draft' as const,
  });

  const [content, setContent] = useState('');

  // 权限验证
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 加载文档
  useEffect(() => {
    if (user && documentId) {
      fetchDocument();
    }
  }, [user, documentId]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);

      if (!response.ok) {
        throw new Error('加载文档失败');
      }

      const data = await response.json();
      const doc = data.document;

      setMetadata({
        title: doc.title,
        description: doc.description || '',
        slug: doc.slug,
        category: doc.category || 'general',
        tags: doc.tags || [],
        status: doc.status,
      });

      setContent(doc.content || '');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '加载文档失败',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 保存文档
  const handleSave = async (publish = false) => {
    if (!metadata.title.trim()) {
      setMessage({ type: 'error', text: '请输入标题' });
      return;
    }

    if (!content.trim()) {
      setMessage({ type: 'error', text: '请输入内容' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metadata,
          content,
          status: publish ? 'published' : 'draft',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '保存失败');
      }

      setMessage({ type: 'success', text: publish ? '发布成功！' : '保存成功！' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '保存失败',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 删除文档
  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      setMessage({ type: 'success', text: '文档已删除' });

      setTimeout(() => {
        router.push('/database-docs');
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '删除失败',
      });
      setShowDeleteConfirm(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                编辑文档
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {metadata.slug}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                disabled={isSaving}
              >
                返回
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving || showDeleteConfirm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {showDeleteConfirm ? '确认删除?' : '删除'}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                保存
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {metadata.status === 'published' ? '更新' : '发布'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：元数据表单 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                文档信息
              </h2>
              <MetadataForm
                initialData={metadata}
                onChange={setMetadata}
              />
            </div>
          </div>

          {/* 右侧：编辑器 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <MdxEditor
                initialValue={content}
                onChange={setContent}
                height="700px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
