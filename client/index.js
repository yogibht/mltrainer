import parentstyles from '@assets/styles/mainstyle.scss';

import { LitElement, html, unsafeCSS } from 'lit-element';

import '@components/shapedownloader.js';
import '@components/datagenerator.js';
import '@components/initialtrainer.js';
import '@components/mainui.js';

class App extends LitElement {
    static get styles() {
        return unsafeCSS(parentstyles.toString());
    }

    constructor(){
        super();
        this.selectedpage = 3;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    selectiveRender(index){
        const AVAILABLEWC = [
            `<shape-downloader></shape-downloader>`,
            `<data-gen></data-gen>`,
            `<init-trainer></init-trainer>`,
            `<main-ui></main-ui>`
        ];

        return AVAILABLEWC[index];
    }

    render(){
        return html([this.selectiveRender(this.selectedpage)]);
    }
}

customElements.define('main-app', App);