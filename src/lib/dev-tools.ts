// Development tools configuration
const devToolsConfig = {
  // React Query DevTools configuration
  reactQuery: {
    initialIsOpen: false,
    position: 'bottom' as const,
    buttonPosition: 'bottom-right' as const,
    // Only show in development
    enabled: process.env.NODE_ENV === 'development',
  },

  // Console logging configuration
  logging: {
    enabled: process.env.NODE_ENV === 'development',
    level: 'debug' as const,
    prefix: '[DevTools]',
  },

  // Performance monitoring
  performance: {
    enabled: process.env.NODE_ENV === 'development',
    trackQueries: true,
    trackMutations: true,
  },
};

// Development utilities
const devUtils = {
  // Log query information
  logQuery: (queryKey: string[], data: unknown, status: string) => {
    if (devToolsConfig.logging.enabled) {
      console.group(`${devToolsConfig.logging.prefix} Query: ${queryKey.join('.')}`);
      console.log('Status:', status);
      console.log('Data:', data);
      console.groupEnd();
    }
  },

  // Log mutation information
  logMutation: (mutationKey: string, data: unknown, status: string) => {
    if (devToolsConfig.logging.enabled) {
      console.group(`${devToolsConfig.logging.prefix} Mutation: ${mutationKey}`);
      console.log('Status:', status);
      console.log('Data:', data);
      console.groupEnd();
    }
  },

  // Log performance metrics
  logPerformance: (operation: string, duration: number) => {
    if (devToolsConfig.performance.enabled) {
      console.log(`${devToolsConfig.logging.prefix} Performance: ${operation} took ${duration}ms`);
    }
  },
};

export { devUtils, devToolsConfig };
