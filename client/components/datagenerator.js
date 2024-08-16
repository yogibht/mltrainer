import { LitElement, html, unsafeCSS } from 'lit-element';

import FileManager from '@utilities/filemanager.js';

class DataGenerator extends LitElement {
    static get styles() {
        return unsafeCSS(`
            #genimage{
                width: 50px;
                height: 50px;
            }
            #genimage > img{
                object-fit: contain;
            }
        `);
    }

    constructor(){
        super();
        this.fileman = new FileManager();
    }

    connectedCallback(){
        super.connectedCallback();
    }

    firstUpdated(){
        if(this.shadowRoot.querySelector("#genimage")){
            this.generateData();
        }
    }

    async generateData(){
        try{
            const allfiles = await this.fileman.getAllFilenames();
            console.log(allfiles);
            const allimagedata = [];
            for(var i=0; i<allfiles.training.length; i++){

                if(this.shadowRoot && this.shadowRoot.querySelector("#genimage")){
                    this.shadowRoot.querySelector("#genimage").setAttribute("src", allfiles.training[i].url);
                    this.requestUpdate();
                }

                const filedata = await this.fileman.getFileData(allfiles.training[i].url);
                const responseblob = await filedata.blob();
                const imagedata = await this.fileman.getImageData(responseblob);

                allimagedata.push({
                    input: imagedata.flat(),
                    output: this.fileman.getOutputData(allfiles.training[i].target),
                    raw: allfiles.training[i]
                });
                this.fileman.testImageData(imagedata);
            }
            
            this.downloadTrainingJsonData(allimagedata, "gesture_data");
        }
        catch(err){
            console.log(err);
        }
    }

    downloadTrainingJsonData(trainingdata, filename){
        try{
            const stringifiedjson = JSON.stringify(trainingdata);
            const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(stringifiedjson);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", filename+".json");
            //document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
        catch(err){
            console.log(err);
        }
    }

    render(){
        return html`
            <div>Generating Data</div>
            <img id="genimage" src="" />
        `;
    }
}

customElements.define('data-gen', DataGenerator);