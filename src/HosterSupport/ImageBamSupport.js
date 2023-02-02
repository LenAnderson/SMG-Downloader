import { $ } from "../lib/basics.js";

export class ImageBamSupport {
	async run() {
		const status = GM_getValue('smg-dpi--imagebam--pleaseWait');
		if (status == 'waiting') {
			log('status = waiting');
			if ($('.view-image')) {
				log('already waited');
				GM_setValue('smg-dpi--imagebam--pleaseWait', 'done');
			} else {
				let done = false;
				while (!done) {
					log('waiting');
					await wait(100);
					const link = $('#continue');
					if (link && link.style.display != 'none') {
						log('found');
						done = true;
						$(link, 'a').click();
						GM_setValue('smg-dpi--imagebam--pleaseWait', 'done');
					}
				}
			}
		}
	}
}