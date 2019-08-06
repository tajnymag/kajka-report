import {facebook} from "./news/facebook";
import {Feed} from "feed";
import {uniqBy} from 'lodash-es';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

const feed = new Feed({
	title: 'Novinky kolejní rady koleje Kajetánka',
	description: 'Neoficiální rss feed shrnující různé zdroje kolejní rady',
	id: 'https://kajka.glitch.me/',
	link: 'https://kajka.glitch.me/',
	language: 'cs',
	copyright: 'Marek Lukáš'
});

app.get('/rss', async (req, res) => {
	const posts = await facebook.getNews();

	posts.forEach(post => {
		if (feed.items.find(item => item.link === post.link)) {
			return;
		}

		feed.addItem({
			title: post.title,
			content: post.content,
			link: post.link,
			date: post.date
		});
	});

    res.type('application/xml');
	res.send(feed.rss2());
});

const listener = app.listen(port, () => {
    console.log('Your app is listening on port ' + port);
});
