import { HosterFactory } from "./HosterFactory.js";
import { $, $$, wait } from "./lib/basics.js";
import { EnqueueDownloadModal } from "./ui/Modal/EnqueueDownloadModal.js";

export class Post {
	/**@type{HTMLElement}*/ root;
	/**@type{HTMLElement}*/ buttonContainer;
	/**@type{HTMLElement}*/ spinner;

	/**@type{string}*/ id;
	/**@type{Date}*/ date;
	/**@type{string}*/ title;
	/**@type{string}*/ thread;

	/**@type{string[]}*/ imageList;

	/**@type{Function}*/ onDownload;




	constructor(/**@type{HTMLElement}*/root) {
		this.root = root;
		this.buttonContainer = $(this.root, '.message-attribution-main');
		this.getMeta();
		this.init();
	}


	getMeta() {
		this.id = this.root.getAttribute('data-content');
		this.date = new Date($(this.root, '.message-attribution-main time').getAttribute('data-time')*1000);
		
		this.thread = document.evaluate('text()', $('.p-body-header .p-title-value'), null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue.textContent.trim();
		
		const body = $(this.root, '.message-body > .bbWrapper').cloneNode(true);
		$$(body, 'noscript').forEach(it=>it.remove());
		const titleTexts = body.textContent.split('\n').filter(it=>it.trim());
		this.title = titleTexts.length ? titleTexts[0] : null;
	}


	async init() {
		const btn = document.createElement('a'); {
			// button--link, button--plain, button--alt,
			// is-disabled, is-hidden, button--scroll, button--icon
			btn.classList.add('button');
			btn.classList.add('button--primary');
			btn.classList.add('button--small');
			btn.classList.add('rippleButton');
			btn.classList.add('is-disabled');
			btn.href = 'javascript:;';
			const text = document.createElement('span'); {
				text.textContent = 'checking...';
				btn.append(text);
			}
			const ripple = document.createElement('div'); {
				ripple.classList.add('ripple-container');
				btn.append(ripple);
			}
			this.buttonContainer.append(btn);
			if (await this.getImages()) {
				btn.addEventListener('click', async()=>{
					await this.downloadImages();
				});
				text.textContent = 'Download Images';
				btn.classList.remove('is-disabled');
			} else {
				text.textContent = 'no images';
				btn.classList.add('smg-dpi--hidden');
			}
		}
	}


	/**@returns{Boolean}*/
	async getImages() {
		log('Post.getImages', this);
		await Promise.all($$(this.root, '.bbCodeBlock--hidden').map(async(hidden)=>{
			$(this.root, 'a.reaction').click();
			while (hidden.classList.contains('bbCodeBlock--hidden')) await wait(100);
		}));
		let imgs = []
			.concat($$(this.root, '.attachment-icon > a[href], .js-lbImage[href]').map(it=>it.href))
			.concat($$(this.root, '.js-lbImage[data-src], .lbContainer > [data-src]').map(it=>it.getAttribute('data-src')))
			.concat($$(this.root, 'video > source').map(it=>it.src))
			;
		const hosters = HosterFactory.get(this.root);
		for (const hoster of hosters) {
			imgs.push(...(await hoster.fetchUrls()));
		}
		imgs = imgs.filter((it,idx)=>imgs.indexOf(it)===idx);
		log(imgs);
		this.imageList = imgs;
		return imgs.length > 0;
	}




	async downloadImages() {
		log('Post.downloadImages', this);
		const dlg = new EnqueueDownloadModal(this);
		await dlg.show();
		const affirm = await dlg.outcome;
		if (affirm && dlg.outcome) {
			log(dlg.outcome);
			if (this.onDownload) {
				this.onDownload(dlg.outcome.thread, dlg.outcome.gallery, this.imageList);
			}
		}
	}
}