import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class ImgBox extends Hoster {
	async fetchUrls() {
		const links = $$(this.post, 'a[href*="https://imgbox.com/"]').map(it=>it.href);
		const imgs = [];
		for (const link of links) {
			const html = await getHtml(link);
			try {
				imgs.push($(html, '.btn > .icon-cloud-download').closest('a').href);
			} catch (ex) {
				log('[ImgBox]', 'FAILED', link);
			}
		}
		return imgs;
	}
}