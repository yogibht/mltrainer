import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

class ModelManager {
    constructor(){
        this.recompiled = false;
        this.viscontainer;
    }

    set visContainer(newcontainer){
        this.viscontainer = newcontainer;
    }

    get visContainer(){
        return this.viscontainer;
    }

    processTrainingData(data){
        return tf.tidy(()=>{
            try{
                const mappedinput = data.map(ds=>ds.input);
                const flattenedinput = [].concat.apply([], mappedinput);

                const mappedoutput = data.map(ds=>ds.output);
                const flattenedoutput = [].concat.apply([], mappedoutput);

                const inputtensors = tf.tensor4d(flattenedinput, [data.length, 32, 32, 1]);
                const outputtensors = tf.tensor2d(flattenedoutput, [data.length, 19]);

                console.log(inputtensors.shape, outputtensors.shape);

                return {
                    inputtensors: inputtensors,
                    outputtensors: outputtensors
                };

            }
            catch(err){console.log(err);}
        });
    }

    async loadConvModel(){
        try{
            const model = await tf.loadLayersModel("/premademodels/gesturemodel.json");
            return model;
        }
        catch(err){console.log(err);}
    }

    createConvModel(){
        return tf.tidy(()=>{
            const model = tf.sequential();
            model.add(tf.layers.conv2d({
                inputShape: [32, 32, 1],
                kernelSize: 3,
                filters: 16,
                activation: "relu"
            }));
            model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));
            model.add(tf.layers.conv2d({
                kernelSize: 3,
                filters: 32,
                activation: "relu"
            }));
            model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));
            model.add(tf.layers.flatten());
            model.add(tf.layers.dense({units: 64, activation: "relu"}));
            model.add(tf.layers.dense({units: 19, activation: "softmax"}));     // This is the output shape, 19 categories
            model.compile({
                optimizer: "rmsprop",
                loss: "categoricalCrossentropy",
                metrics: ["accuracy"]
            });
            model.summary();
            return model;
        });
    }

    async trainModel(model, inputtensors, outputtensors){
        try{
            const historylogs = [];
            await model.fit(inputtensors, outputtensors, {
                batchSize: 400,
                validationSplit: 0.15,
                epochs: 100,     // That's a lot for CNN. Best to keep it between 5 - 15
                callbacks: {
                    onEpochEnd: (epoch, logs)=>{
                        historylogs.push(logs);
                        if(this.viscontainer){
                            tfvis.show.history(this.viscontainer, historylogs, ["acc", "val_acc", "loss", "val_loss"], {width: 500, height: 300, zoomToFit: true});
                        }
                    }
                }
            });
            await model.save('downloads://gesturemodel');
        }
        catch(err){
            console.log(err);
        }
    }

    async refitModel(model, inputdata, outputdata){
        try{
            if(!this.recompiled){
                model.compile({
                    optimizer: "rmsprop",
                    loss: "categoricalCrossentropy",
                    metrics: ["accuracy"]
                });
                this.recompiled = true;
            }

            const newinputtensors = tf.tensor4d(inputdata, [1, 32, 32, 1]);
            const newoutputtensors = tf.tensor2d(outputdata, [1, 19]);

            await model.fit(newinputtensors, newoutputtensors, {epochs: 5});

            return model;
        }
        catch(err){
            console.log(err);
        }
    }

    predictModel(model, data){
        return tf.tidy(()=>{
            const predictiontensor = tf.tensor4d(data.input, [1, 32, 32, 1]);
            const prediction = model.predict(predictiontensor);
            return prediction.dataSync();
        });
    }
}

export default ModelManager;