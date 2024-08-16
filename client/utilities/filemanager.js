import { resample_single } from './imageresizer.js';

import SHAPESDATA from '@assets/availableshapes.json';

export default class FileManager{
    constructor(){}

    getAllFilenames(){
        return new Promise((resolve, reject)=>{
            fetch("/files")
            .then(async responsedata=>{
                const convertedresponse = await responsedata.json();
                resolve(convertedresponse);
            })
            .catch(err=>{
                console.log(err);
                reject(err);
            })
        });
    }

    getIdentityFiles(){
        return new Promise((resolve, reject)=>{
            fetch("/identityfiles")
            .then(async responsedata=>{
                const convertedresponse = await responsedata.json();
                resolve(convertedresponse);
            })
            .catch(err=>{
                console.log(err);
                reject(err);
            })
        });
    }

    async getFileData(fileurl){
        try{
            const filedata = await fetch(fileurl);
            return filedata;
        }
        catch(err){}
    }

    getImageData(imgblob){
        return new Promise((resolve, reject)=>{
            try{
                if(!this.canvas){
                    this.canvas = document.createElement('canvas');
                    this.canvascontext = this.canvas.getContext('2d');

                    document.body.appendChild(this.canvas);
                }

                var img = new Image();
                img.onload = ()=>{
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;

                    this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    this.canvascontext.drawImage(img, 0, 0, img.width, img.height);

                    const resizedimg = resample_single(this.canvas, 32, 32, true);

                    // NOT WORKING
                    const canvascontextdata = this.canvascontext.getImageData(0, 0, resizedimg.width, resizedimg.height).data;

                    const pixeldata_row = [];
                    var pixeldata_col = [];
                    var col=0;
                    for(var i=0; i<canvascontextdata.length; i+=4){
                        
                        if(canvascontextdata[i+3]>0){
                            pixeldata_col.push(canvascontextdata[i+3]/255);
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
                    //console.log(pixeldata_row);
                    resolve(pixeldata_row);
                }
                img.src = URL.createObjectURL(imgblob);
            }
            catch(err){
                console.log(err);
                reject(err);
            }
        })
    }

    getOutputData(_targetnumber){
        const output_arr = [...new Array(SHAPESDATA.length)].map((_, index)=>index===_targetnumber ? 1 : 0);
        return output_arr;
    }

    testImageData(imagedata){
        //console.log(imagedata);
        try{
            if(!this.testcanvas){
                this.testcanvas = document.createElement('canvas');
                this.testcanvascontext = this.testcanvas.getContext('2d');
            }

            this.testcanvascontext.clearRect(0, 0, this.testcanvas.width, this.testcanvas.height);

            this.testcanvas.width = 32;
            this.testcanvas.height = 32;

            document.body.appendChild(this.testcanvas);

            for(var x=0; x<this.testcanvas.width; x++){
                for(var y=0; y<this.testcanvas.height; y++){
                    this.testcanvascontext.fillStyle = `rgba(0,0,0,${Math.round(255 * imagedata[y][x])})`;
                    this.testcanvascontext.fillRect(x, y, 1, 1);
                }
            }
        }
        catch(err){console.log(err);}
    }
}