import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';

// 自定义图片组件，自动填充满宽度
function CustomImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <img 
        src={src}
        alt={alt || ''}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
        {...props}
      />
      {alt && (
        <p style={{
          marginTop: '8px',
          color: '#666',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          {alt}
        </p>
      )}
    </div>
  );
}

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // 覆盖默认的 img 组件
    img: CustomImage,
    ...components,
  };
}
