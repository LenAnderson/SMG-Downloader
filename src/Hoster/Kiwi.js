import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class Kiwi extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-url*="img.kiwi"]').map(it=>it.getAttribute('data-url').replace(/(?:\.th(\.jpg))?$/, '$1'));
	}
}