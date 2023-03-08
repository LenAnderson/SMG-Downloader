import { Hoster } from "../Hoster.js";
import { $$ } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class JpgChurch extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-url*="jpg.church"]').map(it=>it.getAttribute('data-url').replace(/(?:\.(?:th|md)(\.jpg|\.webp))?$/, '$1'));
	}
}