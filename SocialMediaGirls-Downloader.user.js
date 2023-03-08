// ==UserScript==
// @name         SocialMediaGirls - Download Post Images
// @namespace    https://github.com/LenAnderson
// @downloadURL  https://github.com/LenAnderson/SMG-Downloader/raw/master/SocialMediaGirls-Downloader.user.js
// @version      1.8
// @description  Download images from a forum post on SocialMediaGirls.com
// @author       LenAnderson
// @match        https://forums.socialmediagirls.com/threads/*
// @match        https://forum.sexy-egirls.com/threads/*
// @match        https://www.imagebam.com/view/*
// @icon         https://www.google.com/s2/favicons?domain=socialmediagirls.com
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_openInTab
// @connect      *
// ==/UserScript==





(function() {
	'use strict';

// ---------------- IMPORTS  ----------------



// src\lib\basics.js
const log = (...msgs)=>console.log.call(console.log, '[SMG-DPI]', ...msgs);

const $ = (root,query)=>(query?root:document).querySelector(query?query:root);
const $$ = (root,query)=>Array.from((query?root:document).querySelectorAll(query?query:root));

const wait = async(millis)=>(new Promise(resolve=>setTimeout(resolve,millis)));


// src\lib\xhr.js
const get = async(url)=>(new Promise((resolve,reject)=>GM_xmlhttpRequest({
	url: url,
	onload: resolve,
	onerror: reject
})));

const getHtml = async(url)=>{
	const html = document.createElement('div');
	html.innerHTML = (await get(url)).responseText;
	return html;
};

const download = async(/**@type{string}*/url, /**@type{string}*/name, /**@type{Function}*/onProgress)=>{
	log('download', url, name);
	return new Promise(async(resolve)=>{
		GM_xmlhttpRequest({
			url:url,
			responseType:'blob',
			onload:(resp)=>{
				const blob = resp.response;
				log(blob);
				const blobUrl = URL.createObjectURL(blob);
				GM_download({url:blobUrl, name:name, onload:resolve, onerror:(x,y,z)=>{log('ERROR', x,y,z);resolve();}});
			},
			onprogress:(prog)=>{
				onProgress(prog.done, prog.total);
			},
			onerror:(err)=>{
				log('[ERROR]', err.error, err);
			}
		});
	});
};


// src\Hoster.js
class Hoster {
	/**@type{HTMLElement}*/post




	constructor(/**@type{HTMLElement}*/post) {
		this.post = post;
	}


	async fetchUrls() {
		throw 'Hoster.fetchUrls is not implemented!';
	}
}


// src\Hoster\IbbCo.js




class IbbCo extends Hoster {
	async fetchUrls() {
		const links = $$(this.post, 'a[href*="https://ibb.co/"]').map(it=>it.href);
		const imgs = [];
		for (const link of links) {
			const html = await getHtml(link);
			imgs.push($(html, 'link[rel="image_src"]').href);
		}
		return imgs;
	}
}


// src\Hoster\ImageBam.js




class ImageBam extends Hoster {
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


// src\Hoster\ImgBox.js




class ImgBox extends Hoster {
	async fetchUrls() {
		const links = $$(this.post, 'a[href*="https://imgbox.com/"]').map(it=>it.href);
		const imgs = [];
		for (const link of links) {
			const html = await getHtml(link);
			try {
				imgs.push($(html, '.btn > .icon-cloud-download').closest('a').href);
			} catch (ex) {
				log('[ImgBox]', 'FAILED', link);
			}
		}
		return imgs;
	}
}


// src\Hoster\JpgChurch.js




class JpgChurch extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-url*="jpg.church"]').map(it=>it.getAttribute('data-url').replace(/(?:\.(?:th|md)(\.jpg|\.webp))?$/, '$1'));
	}
}


// src\Hoster\Kiwi.js




class Kiwi extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-url*="img.kiwi"]').map(it=>it.getAttribute('data-url').replace(/(?:\.th(\.jpg))?$/, '$1'));
	}
}


// src\Hoster\PixHost.js




class PixHost extends Hoster {
	async fetchUrls() {
		const links = $$(this.post, 'a[href*="https://pixhost.to/"]').map(it=>it.href);
		const imgs = [];
		for (const link of links) {
			if (link.search(/^.+\/gallery\/.*$/) == 0) {
				const html = await getHtml(link);
				const imgLinks = $$(html, '.images > a').map(it=>it.href);
				for (const imgLink of imgLinks) {
					imgs.push(await this.fetchImageUrl(imgLink));
				}
			} else {
				imgs.push(await this.fetchImageUrl(link));
			}
		}
		return imgs;
	}

	async fetchImageUrl(link) {
		const html = await getHtml(link);
		return $(html, '#image').src;
	}
}


// src\Hoster\PixlLi.js




class PixlLi extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-src*="https://i3.pixl.li/"], img[data-src*="https://i.pixl.li/"]').map(it=>it.getAttribute('data-src').replace(/(?:\.(?:md|th)(\.jpg))?$/, '$1'));
	}
}


// src\Hoster\PixlIs.js




class PixlIs extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-src*="https://i.pixl.is/"], img[data-src*="https://i3.pixl.is/"]').map(it=>it.getAttribute('data-src').replace(/(?:\.md(\.jpg))?$/, '$1'));
	}
}


// src\Hoster\Putmega.js




class Putmega extends Hoster {
	async fetchUrls() {
		const links = $$(this.post, 'a[href*="https://putme.ga/image/"], a[href*="https://putmega.com/image/"]').map(it=>it.href);
		const imgs = [];
		for (const link of links) {
			const html = await getHtml(link);
			imgs.push($(html, '.btn-download').href);
		}
		return imgs;
	}
}


// src\Hoster\ZupImages.js




class ZupImages extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[data-src*="https://zupimages.net/up/"]').map(it=>it.getAttribute('data-src'));
	}
}


// src\Hoster\ImxTo.js




class ImxTo extends Hoster {
	async fetchUrls() {
		return $$(this.post, 'img[src*="https://imx.to/u/"]').map(it=>it.src.replace('/t/', '/i/'));
	}
}


// src\HosterFactory.js













class HosterFactory {
	/**@returns{Hoster[]}*/
	static get(/**@type{HTMLElement}*/post) {
		return [
			new Putmega(post),
			new ImgBox(post),
			new PixHost(post),
			new JpgChurch(post),
			new IbbCo(post),
			new ImageBam(post),
			new PixlIs(post),
			new ZupImages(post),
			new Kiwi(post),
			new PixlLi(post),
			new ImxTo(post),
		];
	}
}


// src\lib\date.js
const isoDate = (it)=>`${it.getFullYear()}-${(it.getMonth()+1).toString().padStart(2,'0')}-${it.getDate().toString().padStart(2,'0')}`;


// src\Persistence.js
class Persistence {
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


// src\ui\Modal.js


class Modal {
	/**@type{string}*/ title

	/**@type{HTMLElement}*/ root;
	/**@type{HTMLElement}*/ body;
	/**@type{HTMLElement}*/ buttons;

	/**@type{Promise}*/ outcome;
	/**@type{Function}*/ outcomeResolver;




	constructor(/**@type{string}*/title) {
		this.title = title;

		this.buildDom();
	}


	buildDom() {
		const blocker = document.createElement('div'); {
			this.root = blocker;
			blocker.classList.add('overlay-container');
			blocker.classList.add('is-active');
			const dlg = document.createElement('div'); {
				dlg.classList.add('overlay');
				dlg.setAttribute('role', 'dialog');
				const dlgTitle = document.createElement('div'); {
					dlgTitle.classList.add('overlay-title');
					const dlgClose = document.createElement('a'); {
						dlgClose.classList.add('overlay-titleCloser');
						dlgClose.classList.add('js-overlayClose');
						dlgClose.setAttribute('role', 'button');
						dlgClose.setAttribute('aria-label', 'Close');
						dlgClose.addEventListener('click', ()=>{
							this.hide(false);
						});
						dlgTitle.append(dlgClose);
					}
					dlgTitle.append(document.createTextNode(this.title));
					dlg.append(dlgTitle);
				}
				const dlgContent = document.createElement('div'); {
					dlgContent.classList.add('overlay-content');
					const block = document.createElement('div'); {
						block.classList.add('block-container');
						const body = document.createElement('div'); {
							this.body = body;
							body.classList.add('block-body');
							block.append(body);
						}
						const formRow = document.createElement('dl'); {
							formRow.classList.add('formRow');
							formRow.classList.add('formSubmitRow');
							formRow.classList.add('formSubmitRow--simple');
							formRow.append(document.createElement('dt'));
							const dd = document.createElement('dd'); {
								const main = document.createElement('div'); {
									main.classList.add('formSubmitRow-main');
									const bar = document.createElement('div'); {
										bar.classList.add('formSubmitRow-bar');
										main.append(bar);
									}
									const ctrls = document.createElement('div'); {
										this.buttons = ctrls;
										ctrls.classList.add('formSubmitRow-controls');
										main.append(ctrls);
									}
									dd.append(main);
								}
								formRow.append(dd);
							}
							block.append(formRow);
						}
						dlgContent.append(block);
					}
					dlg.append(dlgContent);
				}
				blocker.append(dlg);
			}
		}
	}


	makeChoices(/**@type{string}*/label, /**@type{string[]}*/choices, /**@type{Boolean}*/addCustomChoice=true) {
		const row = document.createElement('dl'); {
			row.classList.add('formRow');
			row.classList.add('formRow--noColon');
			const dt = document.createElement('dt'); {
				const wrap = document.createElement('div'); {
					wrap.classList.add('formRow-labelWrapper');
					const lbl = document.createElement('label'); {
						lbl.textContent = label;
						wrap.append(lbl);
					}
					dt.append(wrap);
				}
				row.append(dt);
			}
			const dd = document.createElement('dd'); {
				const ul = document.createElement('ul'); {
					ul.classList.add('inputChoices');
					choices.forEach((choice, idx)=>{
						const li = document.createElement('li'); {
							li.classList.add('choiceList-choice');
							const lbl = document.createElement('label'); {
								lbl.classList.add('iconic');
								lbl.classList.add('iconic--radio');
								const inp = document.createElement('input'); {
									inp.type = 'radio';
									inp.name = label;
									inp.value = choice;
									lbl.append(inp);
								}
								const i = document.createElement('i'); {
									lbl.append(i);
								}
								const span = document.createElement('span'); {
									span.classList.add('iconic-label');
									span.textContent = choice;
									lbl.append(span);
								}
								li.append(lbl);
							}
							ul.append(li);
							if (idx == 0) {
								lbl.click();
							}
						}
					});
					if (addCustomChoice) {
						const cust = document.createElement('li'); {
							cust.classList.add('inputChoices-choice');
							const lbl = document.createElement('label'); {
								lbl.classList.add('iconic');
								lbl.classList.add('iconic--radio');
								const inp = document.createElement('input'); {
									inp.type = 'radio';
									inp.name = label;
									inp.value = '__CUSTOM__';
									lbl.append(inp);
								}
								const i = document.createElement('i'); {
									lbl.append(i);
								}
								const span = document.createElement('input'); {
									span.classList.add('iconic-label');
									span.style.position = 'initial';
									span.value = choices[0].split(' ')[0];
									span.name = `${label}__CUSTOM__`;
									span.addEventListener('click', ()=>{
										lbl.click();
										span.focus();
									});
									lbl.append(span);
								}
								cust.append(lbl);
							}
							ul.append(cust);
						}
					}
					dd.append(ul);
				}
				row.append(dd);
			}
		}
		return row;
	}




	async show() {
		this.outcome = new Promise(resolve=>this.outcomeResolver=resolve);
		document.body.append(this.root);
	}

	async hide(result) {
		this.root.remove();
		this.outcomeResolver(result);
	}
}


// src\ui\Modal\EnqueueDownloadModal.js





class EnqueueDownloadModal extends Modal {
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


// src\Post.js




class Post {
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


// src\lib\BindingTarget.js
class BindingTarget {
	/**@type {Object}*/ key;
	/**@type {HTMLElement}*/ target;
	/**@type {String}*/ attributeName;
	/**@type {Function}*/ targetConverter;
	/**@type {Function}*/ sourceConverter;
	constructor(
		/**@type {Object}*/ key,
		/**@type {HTMLElement}*/ target,
		/**@type {String}*/ attributeName,
		/**@type {Function}*/ targetConverter,
		/**@type {Function}*/ sourceConverter
	) {
		this.key = key;
		this.target = target;
		this.attributeName = attributeName;
		this.targetConverter = targetConverter;
		this.sourceConverter = sourceConverter;
	}
}


// src\lib\Binding.js


class Binding {
	/**@type {Binding[]}*/ static bindings = [];
	/**@type {Object}*/ source;
	/**@type {String}*/ propertyName;
	/**@type {BindingTarget[]}*/ targets = [];
	/**@type {Function}*/ theGetter;
	/**@type {Function}*/ theSetter;
	/**@type {Boolean}*/ isProperty = false;
	value;
	static create(key, source, propertyName, target, attributeName, targetConverter=v=>v, sourceConverter=v=>v) {
		let binding = this.bindings.find(it=>it.source==source&&it.propertyName==propertyName);
		if (!binding) {
			binding = new Binding(source, propertyName);
			this.bindings.push(binding);
		}
		binding.targets.push(new BindingTarget(key, target, attributeName, targetConverter, sourceConverter));
		binding.setTargetValue();
		switch (target.tagName) {
			case 'SELECT':
			case 'TEXTAREA':
			case 'INPUT': {
				switch (attributeName) {
					case 'value':
					case 'checked': {
						switch (target.type) {
							case 'radio': {
								target.addEventListener('change', ()=>target.checked?binding.setter(target.value):false);
								break;
							}
							default: {
								target.addEventListener('change', ()=>binding.setter(sourceConverter(target[attributeName])));
								break;
							}
						}
						break;
					}
				}
				break;
			}
		}
		return binding;
	}
	static remove(/**@type {Object}*/key) {
		for (let i=this.bindings.length-1; i>=0; i--) {
			const binding = this.bindings[i];
			for (let ii=binding.targets.length-1; ii>=0; ii--) {
				const target = binding.targets[ii]
				if (target.key == key) {
					binding.targets.splice(ii, 1);
				}
			}
			// if (binding.targets.length == 0) {
			// 	this.bindings.splice(i, 1);
			// }
		}
	}
	
	constructor(source, propertyName) {
		this.source = source;
		this.propertyName = propertyName;
		
		this.value = this.source[this.propertyName];
		const p = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(source), propertyName);
		if (p) {
			this.isProperty = true;
			this.theGetter = p.get.bind(source);
			this.theSetter = p.set.bind(source);
		} else {
			this.theGetter = ()=>this.value;
			this.theSetter = (value)=>this.value=value;
		}
		Object.defineProperty(source, propertyName, {
			get: this.getter.bind(this),
			set: this.setter.bind(this)
		});
		this.setTargetValue();
	}
	getter() {
		return this.theGetter();
	}
	setter(value) {
		let changed = false;
		if (this.isProperty) {
			this.theSetter(value);
			changed = this.getValueOf(this.value) != this.getValueOf(this.theGetter())
		} else {
			changed = this.theGetter() != value;
		}
		if (changed) {
			this.value = this.isProperty ? this.theGetter() : value;
			this.setTargetValue();
		}
	}
	getValueOf(it) {
		if (it !== null && it !== undefined && it.valueOf) {
			return it.valueOf();
		}
		return it;
	}
	setTargetValue() {
		this.targets.forEach(target=>{
			if (target.attributeName.substring(0,5) == 'data-') {
				target.target.setAttribute(target.attributeName, target.targetConverter(this.theGetter()));
			} else {
				target.target[target.attributeName] = target.targetConverter(this.theGetter());
			}
		});
	}
}


// src\ui\Modal\ProgressModal.js



class ProgressModal extends Modal {
	/**@type{String}*/ mainLabel = '';
	/**@type{Number}*/ mainMax = 0;
	/**@type{Number}*/ mainCurrent = 0;
	
	/**@type{String}*/ subLabel = '';
	/**@type{Number}*/ subMax = 0;
	/**@type{Number}*/ subCurrent = 0;
	
	/**@type{Number}*/ fileMax = 0;
	/**@type{Number}*/ fileCurrent = 0;




	constructor() {
		super('Downloading Images');
		this.buildBody();
	}


	buildBody() {
		this.root.classList.add('smg-dpi--prog');
		const mainCont = document.createElement('div'); {
			mainCont.classList.add('formInfoRow');
			mainCont.classList.add('formInfoRow--confirm');
			mainCont.classList.add('smg-dpi--prog--row');
			const lbl = document.createElement('div'); {
				Binding.create(this, this, 'mainLabel', lbl, 'textContent');
				mainCont.appendChild(lbl);
			}
			const outer = document.createElement('div'); {
				outer.classList.add('smg-dpi--prog--outer');
				const inner = document.createElement('div'); {
					inner.classList.add('smg-dpi--prog--inner');
					Binding.create(this, this, 'mainCurrent', inner.style, 'width', v=>`${this.mainCurrent/this.mainMax*100}%`);
					Binding.create(this, this, 'mainMax', inner.style, 'width', v=>`${this.mainCurrent/this.mainMax*100}%`);
					outer.append(inner);
				}
				mainCont.append(outer);
			}
			this.body.append(mainCont);
		}
		
		const subCont = document.createElement('div'); {
			subCont.classList.add('formInfoRow');
			subCont.classList.add('formInfoRow--confirm');
			subCont.classList.add('smg-dpi--prog--row');
			const lbl = document.createElement('div'); {
				Binding.create(this, this, 'subLabel', lbl, 'textContent');
				subCont.appendChild(lbl);
			}
			const outer = document.createElement('div'); {
				outer.classList.add('smg-dpi--prog--outer');
				const inner = document.createElement('div'); {
					inner.classList.add('smg-dpi--prog--inner');
					Binding.create(this, this, 'subCurrent', inner.style, 'width', v=>`${this.subCurrent/this.subMax*100}%`);
					Binding.create(this, this, 'subMax', inner.style, 'width', v=>`${this.subCurrent/this.subMax*100}%`);
					outer.append(inner);
				}
				subCont.append(outer);
			}
			this.body.append(subCont);
		}
		
		const fileCont = document.createElement('div'); {
			fileCont.classList.add('formInfoRow');
			fileCont.classList.add('formInfoRow--confirm');
			fileCont.classList.add('smg-dpi--prog--row');
			const outer = document.createElement('div'); {
				outer.classList.add('smg-dpi--prog--outer');
				outer.classList.add('smg-dpi--small');
				const inner = document.createElement('div'); {
					inner.classList.add('smg-dpi--prog--inner');
					Binding.create(this, this, 'fileCurrent', inner.style, 'width', v=>`${this.fileCurrent/this.fileMax*100}%`);
					Binding.create(this, this, 'fileMax', inner.style, 'width', v=>`${this.fileCurrent/this.fileMax*100}%`);
					outer.append(inner);
				}
				fileCont.append(outer);
			}
			this.body.append(fileCont);
		}

		const btn = document.createElement('button'); {
			btn.classList.add('button');
			btn.classList.add('button--primary');
			btn.type = 'submit';
			btn.addEventListener('click', async()=>{
				await this.hide(false);
			});
			const txt = document.createElement('span'); {
				txt.classList.add('button-text');
				txt.textContent = 'Abort';
				btn.append(txt);
			}
			this.buttons.append(btn);
		}
	}
}


// src\Downloader.js





class Downloader {
	/**@type{ProgressModal}*/ progress;

	/**@type{Post[]}*/ postList;

	/**@type{Object[]}*/ queue = [];
	/**@type{Boolean}*/ isProcessing = false;
	/**@type{Boolean}*/ doProcess = false;




	constructor() {
		this.init();
	}


	async init() {
		log('Downloader.init');
		const css = document.createElement('style'); {
			css.innerHTML = '.smg-dpi--hidden {  visibility: hidden;}.smg-dpi--prog {  background-color: transparent;  pointer-events: none;}.smg-dpi--prog > .overlay {  pointer-events: all;}.smg-dpi--prog .smg-dpi--prog--row {  padding: 5px 16px;}.smg-dpi--prog .smg-dpi--prog--outer {  background-color: #212428;  display: inline-block;  height: 10px;  width: 400px;}.smg-dpi--prog .smg-dpi--prog--outer.smg-dpi--small {  height: 3px;}.smg-dpi--prog .smg-dpi--prog--inner {  background-color: #8BC34A;  height: 100%;  width: 0%;}';
			document.body.append(css);
		}
		this.progress = new ProgressModal();
		this.postList = $$('.message--post[data-content]').map(it=>{
			const post = new Post(it);
			post.onDownload = (dir, subdir, imgs)=>{
				this.enqueue(dir, subdir, imgs);
			};
			return post;
		});
		log(this.postList);
	}




	enqueue(/**@type{string}*/dir, /**@type{string}*/subdir, /**@type{string[]}*/imgs) {
		log('Downloader.enqueue', dir, subdir, imgs);
		this.queue.push({dir:dir, subdir:subdir, imgs:imgs});
		this.progress.mainMax++;
		this.processDownloads();
	}


	async processDownloads() {
		log('Downloader.processDownloads');
		if (this.isProcessing) return;
		if (this.queue.length == 0) return;
		this.doProcess = true;
		this.isProcessing = true;
		await this.progress.show();
		while (this.doProcess && this.queue.length > 0) {
			const dl = this.queue.shift();
			this.progress.mainCurrent++;
			this.progress.mainLabel = `${dl.dir} / ${dl.subdir}`;
			this.progress.subMax = dl.imgs.length;
			this.progress.subCurrent = 0;
			for (const img of dl.imgs) {
				if (!this.doProcess) break;
				const fname = img.replace(/^.*?\/([^\/]+?)[\.-]([^\-\/\.]+)(?:\.\d+\/?)?$/, '$1.$2').split('?')[0];
				this.progress.subCurrent++;
				this.progress.subLabel = fname;
				try {
					await download(img, `SocialMediaGirls/${dl.dir.trim()}/${dl.subdir.trim()}/${fname.trim()}`, (done, total)=>{
						this.progress.fileCurrent = done;
						this.progress.fileMax = total;
					});
				} catch (ex) {
					alert(ex);
				}
				await wait(100);
			}
			await wait(100);
		}
		await this.progress.hide();
		this.progress.mainMax = 0;
		this.progress.mainCurrent = 0;
		this.isProcessing = false;
	}
}


// src\HosterSupport\ImageBamSupport.js


class ImageBamSupport {
	async run() {
		const status = GM_getValue('smg-dpi--imagebam--pleaseWait');
		if (status == 'waiting') {
			log('status = waiting');
			const thumb = $('.main-content .images a.thumbnail');
			if (thumb) {
				log('this is an album');
				location.href = `${thumb.href}#smg-dpi--pleaseWait`;
			} else if ($('.view-image')) {
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
// ---------------- /IMPORTS ----------------


	log(location.host, location.hash);
	switch (location.host) {
		case 'www.imagebam.com': {
			if (location.hash == '#smg-dpi--pleaseWait') {
				const dl = new ImageBamSupport();
				dl.run();
			}
			break;
		}
		default: {
			const dl = new Downloader();
			break;
		}
	}
})();