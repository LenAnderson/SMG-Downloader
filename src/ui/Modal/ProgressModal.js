import { Binding } from "../../lib/Binding.js";
import { Modal } from "../Modal.js";

export class ProgressModal extends Modal {
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