'use client';

import Link from 'next/link';
import { useRouteLoadingContext } from './PageLoader';
import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function LoadingLink({ href, children, className, onClick }: LoadingLinkProps) {
  const { startLoading } = useRouteLoadingContext();
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Don't intercept if default was prevented or it's a new tab/window
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }

    // Don't intercept external links
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    // Don't intercept hash links on same page
    if (href.startsWith('#')) {
      return;
    }

    // Start loading and navigate
    e.preventDefault();
    startLoading();
    
    // Delay to ensure loading state is visible
    setTimeout(() => {
      router.push(href);
    }, 50);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

// Hook for programmatic navigation with loading
export function useLoadingNavigation() {
  const { startLoading } = useRouteLoadingContext();
  const router = useRouter();

  const navigate = (href: string) => {
    startLoading();
    setTimeout(() => {
      router.push(href);
    }, 50);
  };

  return { navigate };
}