import {Feed} from "feed";
import {Connection, createConnection} from "typeorm";
import {differenceInMinutes} from 'date-fns';
import express from 'express';

import {facebook} from "./news/facebook";

import {Post} from "./entity/Post";
import {Log} from "./entity/Log";

const app = express();

let connection: Connection;

app.get('/rss', async (req, res) => {
	if (!connection) {
		connection = await createConnection();
	}
	const postRepository = connection.getRepository(Post);
	const logRepository = connection.getRepository(Log);

	const latestScrapes = await logRepository.find({
		order: {
			date: 'DESC'
		},
		take: 1
	});
	if (!latestScrapes[0] || !latestScrapes[0].date || Math.abs(differenceInMinutes(latestScrapes[0].date, new Date())) > 10) {
		const posts = await facebook.getNews();
		let added = 0;

		for (const post of posts) {
			const foundPost = await postRepository.findOne({where: {content: post.content}});

			if (foundPost) {
				continue;
			}

			const dbPost = new Post();
			dbPost.title = post.title;
			dbPost.content = post.content;
			dbPost.link = post.link;
			dbPost.date = post.date;

			await postRepository.save(dbPost);
			added += 1;
		}
		const log = new Log();
		log.addedCount = added;
		log.date = new Date();
		await logRepository.save(log);
	}

	const posts = await postRepository.find();

	const feed = new Feed({
		title: 'Novinky kolejní rady koleje Kajetánka',
		description: 'Neoficiální rss feed shrnující různé zdroje kolejní rady',
		id: 'https://kajka.glitch.me/',
		link: 'https://kajka.glitch.me/',
		language: 'cs',
		copyright: 'Marek Lukáš'
	});
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

export default app;
