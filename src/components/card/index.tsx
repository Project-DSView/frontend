import { memo } from 'react';
import Image from 'next/image';
import { FeatureCardProps } from '@/types';
import { motion } from 'framer-motion';
import { cardVariants, iconVariants } from '@/lib/animations';

const FeatureCard = memo(({ feature, index }: FeatureCardProps) => (
  <motion.div
    className="group relative h-full overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500"
    variants={cardVariants}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    whileHover="hover"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {/* Gradient Border Effect */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    {/* Content */}
    <div className="relative z-10">
      <motion.div
        variants={iconVariants}
        whileHover="hover"
        className="mb-6 flex justify-center"
      >
        <div className="relative">
          <Image
            src={feature.iconSrc}
            alt={feature.iconAlt}
            width={100}
            height={100}
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            priority={feature.priority}
            loading={feature.priority ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </motion.div>
      
      <h3 className="gradient-text mb-4 text-xl font-bold group-hover:text-primary transition-colors duration-300">
        {feature.title}
      </h3>
      <p className="text-neutral text-sm leading-relaxed group-hover:text-neutral/80 transition-colors duration-300">
        {feature.desc}
      </p>
    </div>

    {/* Hover Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
  </motion.div>
));

FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;
