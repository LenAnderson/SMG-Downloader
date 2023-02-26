// ==UserScript==
// @name         SocialMediaGirls - Download Post Images
// @namespace    https://github.com/LenAnderson
// @downloadURL  https://github.com/LenAnderson/SMG-Downloader/raw/master/SocialMediaGirls-Downloader.user.js
// @version      1.7
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

import { Downloader } from "./Downloader.js";
import { ImageBamSupport } from "./HosterSupport/ImageBamSupport.js";
import { log } from "./lib/basics.js";

(function() {
	'use strict';

	// ${imports}

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