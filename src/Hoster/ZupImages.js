import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class ZupImages extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-src*="https://zupimages.net/up/"]').map(it=>it.getAttribute('data-src'));
	}
}