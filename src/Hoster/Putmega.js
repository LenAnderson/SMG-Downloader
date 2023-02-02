import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class Putmega extends Hoster {
	async fetchUrls() {
		const links = $$(this.post, 'a[href*="https://putme.ga/image/"], a[href*="https://putmega.com/image/"]').map(it=>it.href);
		const imgs = [];
		for (const link of links) {
			const html = await getHtml(link);
			imgs.push($(html, '.btn-download').href);
		}
		return imgs;
	}
}