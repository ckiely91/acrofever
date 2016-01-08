Template.blogList.onCreated(function() {
	//SEO stuff
	var title = 'Blog - Acrofever';
	var description = 'Acrofever is an Acrophobia clone for the modern web. If you never played Acrophobia, it\'s a fun, zany word game in which players create phrases from a randomly generated acronym, then vote for their favourites.';
	var metadata = {
		'description': description,
		'og:description': description,
		'og:title': title,
		'og:image': 'https://acrofever.com/images/fb-image.png',
		'twitter:card': 'summary'
	};

	DocHead.setTitle(title);
	_.each(metadata, function(content, name) {
		DocHead.addMeta({name: name, content: content})
	});
});

Template.seoTags.onCreated(function() {
	var post = this.data;

	var title = post.title + ' - Acrofever';
	var description = post.excerpt;
	var image = post.featuredImage || 'https://acrofever.com/images/fb-image.png';
	var metadata = {
		'description': description,
		'og:type': 'article',
		'og:description': description,
		'og:title': title,
		'og:image': image,
		'twitter:card': 'summary'
	};

	DocHead.setTitle(title);
	_.each(metadata, function(content, name) {
		DocHead.addMeta({name: name, content: content})
	});
});