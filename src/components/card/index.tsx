import { memo } from 'react';
import Image from 'next/image';
import { FeatureCardProps } from '@/types';

const FeatureCard = memo(({ feature, index }: FeatureCardProps) => (
  <div
    className="p-6 bg-base-100 border rounded-2xl shadow-sm hover:shadow-lg flex flex-col items-center text-center h-full animate-fade-in-up"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <Image
      src={feature.iconSrc}
      alt={feature.iconAlt}
      width={80}
      height={80}
      className="object-contain"
      priority={feature.priority}
      loading={feature.priority ? "eager" : "lazy"}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
    <h3 className="font-semibold text-lg mt-4 mb-2 text-primary">
      {feature.title}
    </h3>
    <p className="text-sm text-neutral">{feature.desc}</p>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;
