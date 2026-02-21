'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface DocumentMetadata {
  title: string;
  description?: string;
  slug?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

interface MetadataFormProps {
  initialData?: Partial<DocumentMetadata>;
  onChange?: (data: DocumentMetadata) => void;
  readOnly?: boolean;
}

export function MetadataForm({
  initialData,
  onChange,
  readOnly = false,
}: MetadataFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'general');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<DocumentMetadata['status']>(
    initialData?.status || 'draft'
  );

  // 自动生成 slug
  useEffect(() => {
    if (!initialData?.slug && title) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, initialData?.slug]);

  // 通知父组件数据变化
  useEffect(() => {
    onChange?.({
      title,
      description,
      slug,
      category,
      tags,
      status,
    });
  }, [title, description, slug, category, tags, status, onChange]);

  // 添加标签
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 标签输入框键盘事件
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={readOnly}
          placeholder="输入文档标题"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Slug (URL路径)
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={readOnly}
          placeholder="自动生成或手动输入"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          URL 将是: /docs/{slug || 'your-slug'}
        </p>
      </div>

      {/* 描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          描述
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={readOnly}
          placeholder="输入文档描述（可选）"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
      </div>

      {/* 分类 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          分类
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={readOnly}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="general">通用</option>
          <option value="tutorial">教程</option>
          <option value="guide">指南</option>
          <option value="reference">参考</option>
          <option value="api">API 文档</option>
          <option value="blog">博客</option>
        </select>
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          标签
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-md"
            >
              {tag}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <X size={14} />
                </button>
              )}
            </span>
          ))}
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="输入标签后按回车"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              添加
            </button>
          </div>
        )}
      </div>

      {/* 状态 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          状态
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === 'draft'}
              onChange={(e) => setStatus(e.target.value as 'draft')}
              disabled={readOnly}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">草稿</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === 'published'}
              onChange={(e) => setStatus(e.target.value as 'published')}
              disabled={readOnly}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">已发布</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="archived"
              checked={status === 'archived'}
              onChange={(e) => setStatus(e.target.value as 'archived')}
              disabled={readOnly}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">归档</span>
          </label>
        </div>
      </div>
    </div>
  );
}
