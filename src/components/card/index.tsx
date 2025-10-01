import { memo } from 'react';
import Image from 'next/image';
import { FeatureCardProps } from '@/types';

const FeatureCard = memo(({ feature, index }: FeatureCardProps) => (
  <div
    className="bg-base-100 animate-fade-in-up flex h-full flex-col items-center rounded-2xl border p-6 text-center shadow-sm hover:shadow-lg"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <Image
      src={feature.iconSrc}
      alt={feature.iconAlt}
      width={80}
      height={80}
      className="object-contain"
      priority={feature.priority}
      loading={feature.priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
    <h3 className="text-primary mt-4 mb-2 text-lg font-semibold">{feature.title}</h3>
    <p className="text-neutral text-sm">{feature.desc}</p>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;
