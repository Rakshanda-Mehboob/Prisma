/**
 * PageContainer — shared full-width page wrapper used by every app page.
 *
 * Equivalent to Tailwind: "w-full max-w-7xl mx-auto px-6 lg:px-10 py-6"
 *
 * Usage:
 *   import PageContainer from '../components/PageContainer';
 *   <PageContainer>…page content…</PageContainer>
 *
 * Props:
 *   children   – required, the page content
 *   className  – optional extra class names
 *   style      – optional extra inline styles
 *   as         – element / motion component to render as (default: 'div')
 *   ...rest    – any other props forwarded to the root element (e.g. motion props)
 */
import React from 'react';

const PAGE_CONTAINER_STYLE = {
  width: '100%',
  minWidth: 0,
  margin: 0,
  boxSizing: 'border-box',
};

export default function PageContainer({
  children,
  className = '',
  style = {},
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag
      className={`page-container${className ? ` ${className}` : ''}`}
      style={{ ...PAGE_CONTAINER_STYLE, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

