import { $, log, wait } from "./lib/basics.js";
import { download } from "./lib/xhr.js";
import { Post } from "./Post.js";
import { ProgressModal } from "./ui/Modal/ProgressModal.js";

export class Downloader {
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
			css.innerHTML = '${include-min-esc: css/style.css}';
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