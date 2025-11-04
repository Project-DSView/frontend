/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://dsview.it.kmitl.ac.th/',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', disallow: '/api/' },
      { userAgent: '*', allow: '/' },
    ],
  },
};

module.exports = config;
