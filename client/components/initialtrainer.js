import { LitElement, html, unsafeCSS } from 'lit-element'; 

import ModelManager from './modelmanager.js';

import TRAININGDATA from '@assets/gesture_data.json';

import AVAILABLESHAPES from '@assets/availableshapes.json';

class InitialTrainer extends LitElement {
    static get styles() {
        return unsafeCSS(``);
    }

    constructor(){
        super();

        console.log(TRAININGDATA);
        this.modelman = new ModelManager();
    }

    connectedCallback(){
        super.connectedCallback();
    }

    firstUpdated(){
        if(!this.modelman.visContainer && this.shadowRoot){
            this.modelman.visContainer = this.shadowRoot.querySelector("#trainervis");
            this.trainModel();
        }
    }

    async trainModel(){
        try{
            const processeddataset = this.modelman.processTrainingData(TRAININGDATA);
            const convmodel = this.modelman.createConvModel();
            await this.modelman.trainModel(convmodel, processeddataset.inputtensors, processeddataset.outputtensors);
        }
        catch(err){console.log(err);}
    }

    render(){
        return html`
            <div>Generating Data</div>
            <div id="trainervis"></div>
        `;
    }
}

customElements.define('init-trainer', InitialTrainer);