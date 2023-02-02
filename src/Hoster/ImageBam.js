import { Hoster } from "../Hoster.js";
import { $$, wait } from "../lib/basics.js";
import { getHtml } from "../lib/xhr.js";

export class ImageBam extends Hoster {
	/**@type {Promise}*/ static pleaseWait;




	async fetchUrls() {
		const links = $$(this.post, 'a[href*="https://www.imagebam.com/"]').map(it=>it.href);
		const imgs = [];
		for (const link of links) {
			await this.waitForPleaseWait(link);
			const html = await getHtml(link);
			imgs.push($(html, '.view-image > a > img + img').src);
		}
		return imgs;
	}

	async waitForPleaseWait(link) {
		if (!this.constructor.pleaseWait) {
			this.constructor.pleaseWait = new Promise(async(resolve)=>{
				GM_setValue('smg-dpi--imagebam--pleaseWait', 'waiting');
				const bam = GM_openInTab(`${link}#smg-dpi--pleaseWait`);
				let done = false;
				while (!done) {
					await wait(100);
					const status = GM_getValue('smg-dpi--imagebam--pleaseWait');
					switch (status) {
						case 'waiting': {
							break;
						}
						case 'done': {
							done = true;
							break;
						}
						default: {
							log(status, 'unknown status');
							done = true;
							break;
						}
					}
				}
				bam.close();
				resolve();
			});
		}
		await this.constructor.pleaseWait;
	}
}