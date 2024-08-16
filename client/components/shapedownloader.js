import { LitElement, html, unsafeCSS } from 'lit-element'; 
import ShapeGenerator from './shapegenerator.js';
import AVAIALBLESHAPES from '@assets/availableshapes.json';

class ShapeDownloader extends LitElement {
    static get styles() {
        return unsafeCSS(`
            .root-container{
                font-family: Verdana, sans-serif;
                width: 100%;
                height: 100%;
            }

            select {
                appearance: none;
                background-color: transparent;
                border: none;
                padding: 0 1em 0 0;
                margin: 0;
                width: 100%;
                font-family: inherit;
                font-size: inherit;
                cursor: inherit;
                line-height: inherit;

                z-index: 1;

                &::-ms-expand {
                    display: none;
                }

                outline: none;
            }
              
            .select {
                display: grid;
                grid-template-areas: "select";
                align-items: center;
                position: relative;
                
                select,
                &::after {
                    grid-area: select;
                }
                
                min-width: 15ch;
                max-width: 30ch;
                
                border: 1px solid #777;
                border-radius: 0.25em;
                padding: 0.25em 0.5em;
                
                font-size: 1.25rem;
                cursor: pointer;
                line-height: 1.1;

                background-color: #fff;
                background-image: linear-gradient(to top, #f9f9f9, #fff 33%);

                &::after {
                    content: "";
                    justify-self: end;
                    width: 0.8em;
                    height: 0.5em;
                    background-color: #777;
                    clip-path: polygon(100% 0%, 0 0%, 50% 100%);
                }
            }
              
            select:focus + .focus {
                position: absolute;
                top: -1px;
                left: -1px;
                right: -1px;
                bottom: -1px;
                /*border: 2px solid blue;*/
                border-radius: inherit;
            }
            
            .select--disabled {
                cursor: not-allowed;
                background-color: #eee;
                background-image: linear-gradient(to top, #ddd, #eee 33%);
            }

            #main-canvas{
                width: 200px;
                height: 200px;
                border: 1px solid red;
                margin-top: 32px;
            }

            .buttons-container{
                position: relative;
                margin-top: 12px;
            }
            button{
                border: none;
                background: none;
                font-family: Verdana, sans-serif;
                font-size: 20px;
                padding: 6px 8px;
                cursor: pointer;
                background-color: #d98d30;
                border: 1px solid #000;
                border-radius: 4px;
            }

        `);
    }
    
    constructor(){
        super();

        this.maincanvas;
        this.maincanvascontext;

        this.strokewidth = 5;

        this.scaleX;
        this.scaleY;

        this.filecount = 0;
        this.gesturetype = AVAIALBLESHAPES[0].name;

        this.shapegen;
    }

    connectedCallback(){
        super.connectedCallback();
    }

    firstUpdated(){
        this.prepCanvas();
    }

    prepCanvas(){
        if(!this.maincanvas){
            this.maincanvas = this.shadowRoot.getElementById('main-canvas');
            
            this.maincanvas.width = 200;
            this.maincanvas.height = 200;

            this.maincanvascontext = this.maincanvas.getContext("2d");
            this.maincanvasboundingrect = this.maincanvas.getBoundingClientRect();

            this.scaleX = this.maincanvas.width / this.maincanvasboundingrect.width;
            this.scaleY = this.maincanvas.height / this.maincanvasboundingrect.height;

            this.shapegen = new ShapeGenerator(this.maincanvas, this.maincanvascontext, this.strokewidth);
        }
    }

    clearCanvas(){
        if(this.maincanvas){
            this.maincanvascontext.clearRect(0, 0, this.maincanvas.width, this.maincanvas.height);
        }
    }

    generateShape(){
        const selectedshape = AVAIALBLESHAPES.find(shape=>shape.name===this.gesturetype);
        this.shapegen[selectedshape.method](...selectedshape.args, true);

        this.filecount = "identity";
    }

    generateBunchOfShapes(){
        this.filecount = 0;

        const selectedshape = AVAIALBLESHAPES.find(shape=>shape.name===this.gesturetype);

        const intervalid = setInterval(()=>{
            this.shapegen[selectedshape.method](...selectedshape.args);
            this.downloadGestureImage(true);
            this.clearCanvas();
            this.filecount += 1;

            if(this.filecount > 25){
                clearInterval(intervalid);
            }
        }, 250);
    }

    downloadGestureImage(){
        if(this.maincanvas){
            const dataurl = this.maincanvas.toDataURL({
                format: 'png',
                left: 0,
                top: 0,
                width: 200,
                height: 200
            });
            const gesturefilename = `${this.gesturetype}_${this.filecount}.png`;
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataurl);
            downloadAnchorNode.setAttribute("download", gesturefilename);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    }

    selectShape(event){
        try{
            this.gesturetype = event.target.value;
            this.filecount = 0;
            this.clearCanvas();
            this.requestUpdate();
        }
        catch(err){console.log(err);}
    }

    render(){
        return html`
            <div class="root-container">

                <label for="standard-select">Gesture:</label>
                <div class="select">
                    <select id="standard-select" @change=${this.selectShape}>
                        ${AVAIALBLESHAPES.map(shape=>{
                            return html`
                                <option value="${shape.name}">${shape.name}</option>
                            `;
                        })}
                    </select>
                </div>

                <canvas id="main-canvas"></canvas>

                <div class="buttons-container">
                    <button @click=${this.clearCanvas}>Clear</button>
                    <button @click=${this.downloadGestureImage}>Download</button>
                    <button @click=${this.generateShape}>Generate Shape</button>
                    <button @click=${this.generateBunchOfShapes}>Generate Bunch Of Shapes</button>
                </div>
            </div>
        `;
    }
}

customElements.define('shape-downloader', ShapeDownloader);