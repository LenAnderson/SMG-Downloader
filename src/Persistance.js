export class Persistance {
	static get threadDict() {
		return JSON.parse(localStorage.getItem('smg-dpi--threadDict') || '{}');
	}
	static set threadDict(value) {
		localStorage.setItem('smg-dpi--threadDict', JSON.stringify(value));
	}

	static get galDict() {
		return JSON.parse(localStorage.getItem('smg-dpi--galDict') || '{}');
	}
	static set galDict(value) {
		localStorage.setItem('smg-dpi--galDict', JSON.stringify(value));
	}




	/**@returns{string}*/
	static getThread(/**@type{string}*/key) {
		return this.threadDict[key];
	}
	static setThread(/**@type{string}*/key, /**@type{string}*/value) {
		const dict = this.threadDict;
		dict[key] = value;
		this.threadDict = dict;
	}
	
	/**@returns{string}*/
	static getGal(/**@type{string}*/key) {
		return this.galDict[key];
	}
	static setGal(/**@type{string}*/key, /**@type{string}*/value) {
		const dict = this.galDict;
		dict[key] = value;
		this.galDict = dict;
	}
}