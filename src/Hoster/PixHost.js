import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class PixHost extends Hoster {
	async fetchUrls() {
		const links = $$(this.post, 'a[href*="https://pixhost.to/"]').map(it=>it.href);
		const imgs = [];
		for (const link of links) {
			if (link.search(/^.+\/gallery\/.*$/) == 0) {
				const html = await getHtml(link);
				const imgLinks = $$(html, '.images > a').map(it=>it.href);
				for (const imgLink of imgLinks) {
					imgs.push(await this.fetchImageUrl(imgLink));
				}
			} else {
				imgs.push(await this.fetchImageUrl(link));
			}
		}
		return imgs;
	}

	async fetchImageUrl(link) {
		const html = await getHtml(link);
		return $(html, '#image').src;
	}
}