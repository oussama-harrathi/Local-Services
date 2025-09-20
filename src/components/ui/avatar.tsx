import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }
>(({ className, src, alt, width, height, ...props }, ref) => {
  // Check if it's a base64 image
  if (src && src.startsWith('data:image/') && src.length > 50) {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn('aspect-square h-full w-full object-cover', className)}
        onError={(e) => {
          // Hide the broken image on error
          e.currentTarget.style.display = 'none';
        }}
        {...props}
      />
    );
  }
  
  // Use Next.js Image for regular URLs
  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      width={40}
      height={40}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };