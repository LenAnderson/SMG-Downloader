import { wait } from "../lib/basics.js";

export class Modal {
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