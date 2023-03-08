import { isoDate } from "../../lib/date.js";
import { Persistence } from "../../Persistence.js";
import { Post } from "../../Post.js";
import { Modal } from "../Modal.js";

export class EnqueueDownloadModal extends Modal {
	/**@type{Post}*/ post;




	constructor(/**@type{Post}*/post) {
		super('Download Images');
		this.post = post;
		this.buildBody();
	}


	buildBody() {
		this.body.append(this.makeChoices('Download Location', [
			Persistence.getThread(this.post.thread),
			this.post.thread,
		].filter(it=>it)));
		this.body.append(this.makeChoices('Subfolder', [
			this.post.title ? Persistence.getGal(this.post.title) : false,
			this.post.title ? `${isoDate(this.post.date)} ${this.post.title}` : false,
			`${isoDate(this.post.date)} ${this.post.id}`,
			'Random',
		].filter(it=>it)));

		const btn = document.createElement('button'); {
			btn.classList.add('button');
			btn.classList.add('button--primary');
			btn.type = 'submit';
			btn.addEventListener('click', ()=>{
				let threadVal = $$(this.root, '[name="Download Location"]').find(it=>it.checked).value;
				if (threadVal == '__CUSTOM__') {
					threadVal = $(this.root, '[name="Download Location__CUSTOM__"]').value.trim();
					Persistence.setThread(this.post.thread, threadVal);
				}
				let galVal = $$(this.root, '[name="Subfolder"]').find(it=>it.checked).value;
				if (galVal == '__CUSTOM__') {
					galVal = $(this.root, '[name="Subfolder__CUSTOM__"]').value.trim();
					Persistence.setGal(this.post.title, galVal);
				}
				this.outcome = {
					thread: threadVal,
					gallery: galVal,
				};
				this.hide(true);
			});
			const txt = document.createElement('span'); {
				txt.classList.add('button-text');
				txt.textContent = 'Start Download';
				btn.append(txt);
			}
			this.buttons.append(btn);
		}
	}
}