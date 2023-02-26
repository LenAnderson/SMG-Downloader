import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class ImxTo extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[src*="https://imx.to/u/"]').map(it=>it.src.replace('/t/', '/i/'));
	}
}