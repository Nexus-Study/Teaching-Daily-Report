import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_NODE_ENV === 'development',
  register: true,
})(nextConfig);