interface Feature {
  iconSrc: string;
  iconAlt: string;
  title: string;
  desc: string;
  priority?: boolean;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export type { Feature, FeatureCardProps };
