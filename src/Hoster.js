export class Hoster {
	/**@type{HTMLElement}*/post




	constructor(/**@type{HTMLElement}*/post) {
		this.post = post;
	}


	async fetchUrls() {
		throw 'Hoster.fetchUrls is not implemented!';
	}
}