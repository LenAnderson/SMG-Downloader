export const get = async(url)=>(new Promise((resolve,reject)=>GM_xmlhttpRequest({
	url: url,
	onload: resolve,
	onerror: reject
})));

export const getHtml = async(url)=>{
	const html = document.createElement('div');
	html.innerHTML = (await get(url)).responseText;
	return html;
};

export const download = async(/**@type{string}*/url, /**@type{string}*/name, /**@type{Function}*/onProgress)=>{
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