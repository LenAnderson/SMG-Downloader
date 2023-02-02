import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class PixlIs extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-src*="https://i.pixl.is/"], img[data-src*="https://i3.pixl.is/"]').map(it=>it.getAttribute('data-src').replace(/(?:\.md(\.jpg))?$/, '$1'));
	}
}