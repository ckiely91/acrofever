sitemaps.add('/sitemap.xml', () => {
	return [
		{ page: '/', changefreq: 'daily' },
		{ page: '/play', changefreq: 'daily' },
		{ page: '/halloffame', changefreq: 'weekly' },
		{ page: '/blog'}
	];
});