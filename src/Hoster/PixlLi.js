import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class PixlLi extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-src*="https://i3.pixl.li/"], img[data-src*="https://i.pixl.li/"]').map(it=>it.getAttribute('data-src').replace(/(?:\.(?:md|th)(\.jpg))?$/, '$1'));
	}
}