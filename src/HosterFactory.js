import { Hoster } from "./Hoster.js";
import { IbbCo } from "./Hoster/IbbCo.js";
import { ImageBam } from "./Hoster/ImageBam.js";
import { ImgBox } from "./Hoster/ImgBox.js";
import { JpgChurch } from "./Hoster/JpgChurch.js";
import { Kiwi } from "./Hoster/Kiwi.js";
import { PixHost } from "./Hoster/PixHost.js";
import { PixlLi } from "./Hoster/PixlLi.js";
import { PixlIs } from "./Hoster/PixlIs.js";
import { Putmega } from "./Hoster/Putmega.js";
import { ZupImages } from "./Hoster/ZupImages.js";

export class HosterFactory {
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
		];
	}
}