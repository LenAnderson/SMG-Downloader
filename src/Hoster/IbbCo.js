import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class IbbCo extends Hoster {
	async fetchUrls() {
		const links = $$(this.post, 'a[href*="https://ibb.co/"]').map(it=>it.href);
		const imgs = [];
		for (const link of links) {
			const html = await getHtml(link);
			imgs.push($(html, 'link[rel="image_src"]').href);
		}
		return imgs;
	}
}