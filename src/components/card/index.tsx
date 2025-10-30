import { memo } from 'react';
import Image from 'next/image';
import { FeatureCardProps } from '@/types';
import { motion } from 'framer-motion';
import { cardVariants, iconVariants } from '@/lib/utils/animations';

const FeatureCard = memo(({ feature, index }: FeatureCardProps) => (
  <motion.div
    className="group border-border/20 from-card/10 to-card/5 relative h-full overflow-hidden rounded-2xl border bg-gradient-to-br p-8 text-center shadow-lg backdrop-blur-md transition-all duration-500 hover:shadow-2xl"
    variants={cardVariants}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    whileHover="hover"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {/* Gradient Border Effect */}
    <div className="from-primary/20 via-accent/20 to-secondary/20 absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

    {/* Content */}
    <div className="relative z-10">
      <motion.div variants={iconVariants} whileHover="hover" className="mb-6 flex justify-center">
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
          <div className="from-primary/30 to-accent/30 absolute inset-0 rounded-full bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
        </div>
      </motion.div>

      <h3 className="gradient-text group-hover:text-primary mb-4 text-xl font-bold transition-colors duration-300">
        {feature.title}
      </h3>
      <p className="text-neutral group-hover:text-neutral/80 text-sm leading-relaxed transition-colors duration-300 dark:text-gray-300 dark:group-hover:text-gray-400">
        {feature.desc}
      </p>
    </div>

    {/* Hover Background Gradient */}
    <div className="from-primary/5 via-accent/5 to-secondary/5 absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  </motion.div>
));

FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;
