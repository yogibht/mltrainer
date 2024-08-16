import mainstyle from '@assets/styles/mainstyle.scss';

import { LitElement, html, unsafeCSS } from 'lit-element'; 

import { resample_single } from '@utilities/imageresizer.js';

import ModelManager from './modelmanager.js';
import FileManager from '@utilities/filemanager.js';

import AVAILABLESHAPES from '@assets/availableshapes.json';

class MainUI extends LitElement {
    static get styles() {
        return unsafeCSS(mainstyle.toString());
    }
    
    constructor(){
        super();

        this.maincanvas;
        this.maincanvascontext;

        this.flag = false;
        this.prevX = 0;
        this.currX = 0;
        this.prevY = 0;
        this.currY = 0;
        this.dot_flag = false;

        this.pensize = 10;

        this.scaleX;
        this.scaleY;

        this.identityimages;

        this.mode = "test";

        this.istraining = false;
        this.showtrainingcomplete = false;
        this.blinkshapes = false;

        this.modelman = new ModelManager();
        this.fileman = new FileManager();

        this.prediction;
        this.shapetotrain;

        this._loading = true;
    }

    connectedCallback(){
        super.connectedCallback();
    }

    firstUpdated(){
        if(!this.identityimages){
            this.getIdentityImages();
        }
    }

    async getIdentityImages(){
        try{
            this.identityimages = await this.fileman.getIdentityFiles();
            this.requestUpdate();
            setTimeout(()=>{
                this.prepCanvas();
            }, 1000);
        }
        catch(err){console.error(err);}
    }

    async prepCanvas(){
        this.maincanvas = this.shadowRoot.getElementById('main-canvas');
        
        this.maincanvas.width = 400;
        this.maincanvas.height = 400;

        this.maincanvascontext = this.maincanvas.getContext("2d");
        this.maincanvasboundingrect = this.maincanvas.getBoundingClientRect();

        this.scaleX = this.maincanvas.width / this.maincanvasboundingrect.width;
        this.scaleY = this.maincanvas.height / this.maincanvasboundingrect.height;

        this.maincanvas.addEventListener("mousemove", (event)=>{event.preventDefault();this.drawInCanvas({clientX: event.clientX, clientY: event.clientY}, false);}, false);
        this.maincanvas.addEventListener("mousedown", (event)=>{event.preventDefault();this.drawInCanvas({clientX: event.clientX, clientY: event.clientY}, true);}, false);
        this.maincanvas.addEventListener("mouseup", (event)=>{this.flag = false;}, false);
        this.maincanvas.addEventListener("mouseout", (event)=>{this.flag = false;}, false);

        this.maincanvas.addEventListener("touchstart", (event)=>{event.preventDefault();this.drawInCanvas({clientX: event.changedTouches[0].clientX, clientY: event.changedTouches[0].clientY}, true);}, false);
        this.maincanvas.addEventListener("touchmove", (event)=>{event.preventDefault();this.drawInCanvas({clientX: event.changedTouches[0].clientX, clientY: event.changedTouches[0].clientY}, false);}, false);
        this.maincanvas.addEventListener("touchend", (event)=>{this.flag = false;}, false);
        this.maincanvas.addEventListener("touchcancel", (event)=>{this.flag = false;}, false);

        this.convmodel = await this.modelman.loadConvModel();

        this._loading = false;
        this.requestUpdate();

        // window.addEventListener("resize",()=>{
        //     this.prepCanvas();
        // });
    }

    drawInCanvas(clientpos, startdrawing){
        if(startdrawing){

            if(this.prediction){
                this.prediction = undefined;
                this.requestUpdate();
            }    

            this.prevX = this.currX;
            this.prevY = this.currY;

            // this.currX = event.clientX - this.maincanvas.offsetLeft;
            // this.currY = event.clientY - this.maincanvas.offsetTop;
            
            this.currX = (clientpos.clientX - this.maincanvasboundingrect.left) * this.scaleX;
            this.currY = (clientpos.clientY - this.maincanvasboundingrect.top) * this.scaleY;
    
            this.flag = true;
            this.dot_flag = true;
            if(this.dot_flag){
                this.maincanvascontext.beginPath();
                this.maincanvascontext.fillStyle = "#000";
                this.maincanvascontext.fillRect(this.currX, this.currY, this.pensize, this.pensize);
                this.maincanvascontext.closePath();
                this.dot_flag = false;
            }
        }
        else if(this.flag){
            this.prevX = this.currX;
            this.prevY = this.currY;

            // this.currX = event.clientX - this.maincanvas.offsetLeft;
            // this.currY = event.clientY - this.maincanvas.offsetTop;

            this.currX = (clientpos.clientX - this.maincanvasboundingrect.left) * this.scaleX;
            this.currY = (clientpos.clientY - this.maincanvasboundingrect.top) * this.scaleY;

            this.maincanvascontext.beginPath();
            this.maincanvascontext.moveTo(this.prevX, this.prevY);
            this.maincanvascontext.lineTo(this.currX, this.currY);
            this.maincanvascontext.strokeStyle = "#000";
            this.maincanvascontext.lineWidth = this.pensize;
            this.maincanvascontext.stroke();
            this.maincanvascontext.closePath();
        }
    }

    clearCanvas(preservevars){
        if(this.maincanvas){
            this.maincanvascontext.clearRect(0, 0, this.maincanvas.width, this.maincanvas.height);
        }

        if(typeof preservevars!=="boolean"){
            this.prediction = undefined;
            this.shapetotrain = undefined;
            this.istraining = false;
            this.showtrainingcomplete = false;
            this.requestUpdate();
        }
    }

    getResizedCanvasImage(){
        const resizedimg = resample_single(this.maincanvas, 32, 32, false);

        const pixeldata_row = [];
        var pixeldata_col = [];
        var col=0;
        for(var i=0; i<resizedimg.data.length; i+=4){
            
            if(resizedimg.data[i+3]>0){
                pixeldata_col.push(resizedimg.data[i+3]/255);
            }
            else{
                pixeldata_col.push(0);
            }

            if(col === resizedimg.width - 1){
                pixeldata_row.push(pixeldata_col);
                pixeldata_col = [];
                col = 0;
            }
            else{
                col++;
            }
        }
        
        const flattenedinput = pixeldata_row.flat();

        return flattenedinput;
    }

    predictShape(){
        try{
            const shapetopredict = this.getResizedCanvasImage();

            const predictedvalue = this.modelman.predictModel(this.convmodel, {input: shapetopredict});
            // Need to get probability as well
            const parsedprediction = predictedvalue.map(d=>Math.round(d));
            const predictedshape = AVAILABLESHAPES[parsedprediction.findIndex(d=>d===1)];
            //console.log("Raw Prediction: ", parsedprediction, ", Processed Shape: ", predictedshape);
            this.prediction = predictedshape;
            if(!predictedshape){
                this.prediction = "unknown";
            }
            else{
                const predictedimageelem = this.shadowRoot.getElementById(`shape_${this.prediction.name}`);
                predictedimageelem.scrollIntoView({behavior: 'smooth'});
            }
            this.clearCanvas(true);
            this.requestUpdate();

            setTimeout(()=>{
                this.prediction = undefined;
                this.requestUpdate();
            }, (this.prediction==="unknown"?3000:10000));

        }
        catch(err){
            console.error(err);
        }
    }

    selectShapeToTrain(shapename){
        this.shapetotrain = shapename;
        this.requestUpdate();
    }
    trainShape(){
        if(this.shapetotrain){
            this.istraining = true;
            this.showtrainingcomplete = false;
            this.requestUpdate();

            setTimeout(async ()=>{
                try{
                    //console.log(this.shapetotrain, AVAILABLESHAPES);
                    const selectedshapeindex = AVAILABLESHAPES.findIndex(shape=>shape.name===this.shapetotrain);

                    const shapetotrain = this.getResizedCanvasImage();
                    const output_arr = [...new Array(AVAILABLESHAPES.length)].map((_, index)=>index===selectedshapeindex ? 1 : 0);

                    this.convmodel = await this.modelman.refitModel(this.convmodel, shapetotrain, output_arr);
                    //console.log("Re-Trained");
                    this.clearCanvas(true);
                    this.istraining = false;
                    this.showtrainingcomplete = true;
                    this.requestUpdate();

                    setTimeout(()=>{
                        this.showtrainingcomplete = false;
                        this.requestUpdate();
                    }, 3000);
                }
                catch(err){
                    console.error(err);
                }
            }, 250);
        }
        else{
            this.blinkshapes = true;
            this.requestUpdate();
            setTimeout(()=>{
                this.blinkshapes = false;
                this.requestUpdate();
            }, 2000);
        }
    }

    changeMode(){
        this.prediction = undefined;
        this.shapetotrain = undefined;
        this.showtrainingcomplete = false;
        this.blinkshapes = false;

        if(this.mode==="test"){
            this.mode = "train";
        }
        else if(!this.istraining){
            this.mode = "test";
        }
        this.requestUpdate();
    }

    disableTrainingComplete(){
        this.showtrainingcomplete = false;
        this.requestUpdate();
    }

    render(){
        return html`
            ${this._loading?
                html`<div class="pageloader-container"><div class="pageloader">Loading...</div></div>`
            :null}

            <div class="root-container">

                <div class="header">
                    <div>Gesture Trainer/Tester</div>
                    <div>
                        <span class="mode_label">${this.mode}</span>
                        <input @change=${this.changeMode} class="switch" type="checkbox" id="testtrain_switch" ?checked=${this.mode!=="test"} /><label class="switch_label" for="testtrain_switch">Testing Mode</label>
                    </div>
                </div>

                <div class="selection_result_slot${this.blinkshapes?' blink':''}">
                    ${this.identityimages && this.identityimages.map(imgobj=>{
                        if(this.mode==="test"){
                            return html`
                                <div
                                    id="shape_${imgobj.shape}"
                                    class="identity_image${this.prediction && this.prediction.name===imgobj.shape ? ' predicted' : ''}"
                                >
                                    <img src="${imgobj.url}"/>
                                </div>
                            `;
                        }
                        else{
                            return html`
                                <div
                                    @click=${()=>this.selectShapeToTrain(imgobj.shape)}
                                    id="shape_${imgobj.shape}"
                                    class="identity_image${this.shapetotrain===imgobj.shape ? ' selected' : ''}"
                                >
                                    <img src="${imgobj.url}"/>
                                </div>
                            `;
                        }
                    })}
                    ${this.prediction==="unknown" ? html`<div class="unknown_prediction"><span>Undetermined Prediction</span></div>`:''}
                </div>

                <div class="canvas-container">

                    <canvas id="main-canvas"></canvas>

                    ${this.istraining?
                        html`
                            <div class="training">
                                <div class="loader">Loading...</div>
                                <div>Training</div>
                            </div>
                        `
                    :null}

                    ${!this.istraining && this.showtrainingcomplete?
                        html`<div class="training"><div class="training-complete" @click=${this.disableTrainingComplete}><span>Training Complete</span></div></div>`
                    :null}

                </div>

                <div class="buttons-container">
                    <div><button @click=${this.clearCanvas}>Clear Canvas</button></div>
                    ${this.mode==="test" ?
                        html`<div><button @click=${this.predictShape}>Predict</button></div>`
                    :
                        html`
                            <div><button @click=${this.trainShape}>Train</button></div>
                            <div><button disabled>Save Training Model</button></div>
                        `
                    }
                </div>

                <div class="info-slot">
                    ${this.mode==="test" ?
                        html`
                            <ul>
                                <li>Draw a Shape similar to one of the images above</li>
                                <li>Click Predict to get prediction</li>
                                <li>Predicted Image will be highlighted</li>
                                <li>Star can be 5 pointed star or a star of david</li>
                            </ul>
                        `
                    :
                        html`
                            <ul>
                                <li>Draw the shape</li>
                                <li>Select the image of a shape you want NN to train on</li>
                                <li>Click Train to train the NN</li>
                            </ul>
                        `
                    }
                </div>
            </div>
        `;
    }
}

customElements.define('main-ui', MainUI);