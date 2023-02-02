export const log = (...msgs)=>console.log.call(console.log, '[SMG-DPI]', ...msgs);

export const $ = (root,query)=>(query?root:document).querySelector(query?query:root);
export const $$ = (root,query)=>Array.from((query?root:document).querySelectorAll(query?query:root));

export const wait = async(millis)=>(new Promise(resolve=>setTimeout(resolve,millis)));