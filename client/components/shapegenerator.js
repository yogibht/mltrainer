export default class ShapeGenerator{
    constructor(canvas, canvascontext, linewidth){
        this.canvas = canvas;
        this.canvascontext = canvascontext;
        this.linewidth = linewidth && !isNaN(linewidth) && linewidth > 5 ? linewidth : 5;
    }

    generateSpiral(_type, identity){
        const randomxdiff = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const randomydiff = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        const randomdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        const centerx = (this.canvas.width / 2) + randomxdiff;
        const centery = (this.canvas.height / 2) + randomydiff;

        const a = 7, b = 7;

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.beginPath();
        this.canvascontext.moveTo(centerx, centery);
        for(var i = 0; i < (_type==="reverse" ? 100+randomdisplacement : 110+randomdisplacement); i++){
            var angle = 0.1 * i;
            var x, y;
            if(_type==="reverse"){
                x = centerx + (a + b * angle) * Math.sin(angle);
                y = centery + (a + b * angle) * Math.cos(angle);
            }
            else{
                x = centerx + (a + b * angle) * Math.cos(angle);
                y = centery + (a + b * angle) * Math.sin(angle);
            }

            this.canvascontext.lineTo(x, y);
        }
        this.canvascontext.strokeStyle = "#000";
        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.stroke();
        this.canvascontext.closePath();
    }

    generateWave(identity){
        const randomxdisplacement = identity ? 20 : getRandomInt(15, 25);
        const randomydiff = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        const centery = (this.canvas.height / 2) + randomydiff;

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.beginPath();
        //this.canvascontext.moveTo(0, canvas.height * 0.5);
        for(var x=randomxdisplacement; x<=this.canvas.width - (randomxdisplacement+8); x++){
            var y = centery - (Math.cos(x * 0.1) * 20 );
            this.canvascontext.lineTo(x, y);
        }

        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.strokeStyle = "#000";
        this.canvascontext.stroke();
        this.canvascontext.closePath();
    }

    generateArrow(_direction, identity){
        const absdisplacement = identity ? 100 : getRandomInt(90, 110);
        const displacementdiff = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.beginPath();
        if(_direction==="up"){
            canvas_arrow(this.canvascontext, absdisplacement, 180 + displacementdiff, absdisplacement, 20 + displacementdiff);
        }
        else if(_direction==="down"){
            canvas_arrow(this.canvascontext, absdisplacement, 20 + displacementdiff, absdisplacement, 180 + displacementdiff);
        }
        else if(_direction==="left"){
            canvas_arrow(this.canvascontext, 180 + displacementdiff, absdisplacement, 20 + displacementdiff, absdisplacement);
        }
        else{
            canvas_arrow(this.canvascontext, 20 + displacementdiff, absdisplacement, 180 + displacementdiff, absdisplacement);
        }
        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.strokeStyle = "#000";
        this.canvascontext.closePath();
        this.canvascontext.stroke();
    }

    generateEye(identity){
        const randomxpos = identity ? 100 : getRandomInt(90, 110);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.strokeStyle = "#000";

        this.canvascontext.beginPath();
        //x, y, radius, startangle, endangle, anticlockwise
        this.canvascontext.arc(randomxpos, 230+ydisplacement, 150, toRadian(240), toRadian(300));
        this.canvascontext.arc(randomxpos, -30+ydisplacement, 150, toRadian(60), toRadian(120));
        this.canvascontext.moveTo(randomxpos+17, 100);
        this.canvascontext.arc(randomxpos, 100+ydisplacement, 17, 0, 2 * Math.PI);
        this.canvascontext.closePath();
        this.canvascontext.stroke();
    }

    generateHeart(identity){
        const xdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const kdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const w = 100+xdisplacement, h = 100+ydisplacement;
        const d = Math.min(w, h);
        const k = 50+kdisplacement;

        this.canvascontext.beginPath();
        this.canvascontext.strokeStyle = "#000";
        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.moveTo(k, k + d / 4);
        this.canvascontext.quadraticCurveTo(k, k, k + d / 4, k);
        this.canvascontext.quadraticCurveTo(k + d / 2, k, k + d / 2, k + d / 4);
        this.canvascontext.quadraticCurveTo(k + d / 2, k, k + d * 3/4, k);
        this.canvascontext.quadraticCurveTo(k + d, k, k + d, k + d / 4);
        this.canvascontext.quadraticCurveTo(k + d, k + d / 2, k + d * 3/4, k + d * 3/4);
        this.canvascontext.lineTo(k + d / 2, k + d);
        this.canvascontext.lineTo(k + d / 4, k + d * 3/4);
        this.canvascontext.quadraticCurveTo(k, k + d / 2, k, k + d / 4);
        this.canvascontext.closePath();
        this.canvascontext.stroke();
    }

    generateCircle(identity){
        const xdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const rdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.strokeStyle = "#000";

        this.canvascontext.beginPath();
        this.canvascontext.arc(100+xdisplacement, 100+ydisplacement, 50+rdisplacement, 0, 2 * Math.PI);
        this.canvascontext.closePath();
        this.canvascontext.stroke();
    }

    generateStar(identity){
        const randomx = identity ? 100 : getRandomInt(90, 110);
        const randomy = identity ? 100 : getRandomInt(90, 110);
        const randomradius = identity ? 50 : getRandomInt(40, 60);

        const xdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const randomtype = getRandomInt(1, 3)===1 ? "davidstar" : "polystar";

        if(randomtype==="polystar"){
            const alpha = (2 * Math.PI) / 10; 
            const radius = randomradius;
            const origin = [randomx,randomy];

            this.canvascontext.lineWidth = this.linewidth;
            this.canvascontext.strokeStyle = "#000";

            this.canvascontext.beginPath();

            for(var i = 11; i>0; i--){
                const r = radius*(i % 2 + 1)/2;
                const omega = alpha * i;
                this.canvascontext.lineTo((r * Math.sin(omega)) + origin[0], (r * Math.cos(omega)) + origin[1]);
            }
            this.canvascontext.closePath();
            this.canvascontext.stroke();
        }
        else{
            this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.canvascontext.strokeStyle = "#000";
            this.canvascontext.lineWidth = this.linewidth;

            this.canvascontext.translate(xdisplacement, ydisplacement);
            for(var i=0; i<2; i++){
                this.canvascontext.beginPath();
                this.canvascontext.moveTo(100, 20);
                this.canvascontext.lineTo(40, 140);
                this.canvascontext.lineTo(160, 140);
                this.canvascontext.closePath();
                this.canvascontext.stroke();

                this.canvascontext.translate(200, 200);
                this.canvascontext.rotate(toRadian(180));
            }

            this.canvascontext.resetTransform();
        }
    }

    generateCross(_type, identity){
        const xdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.strokeStyle = "#000";

        if(_type==="diagonal"){
            this.canvascontext.translate(100+xdisplacement, -50+ydisplacement);
            this.canvascontext.rotate(toRadian(45));
        }

        this.canvascontext.beginPath();

        this.canvascontext.moveTo(40+xdisplacement,100+ydisplacement);
        this.canvascontext.lineTo(160+xdisplacement,100+ydisplacement);
        this.canvascontext.stroke();

        this.canvascontext.beginPath();
        this.canvascontext.moveTo(100+xdisplacement,40+ydisplacement);
        this.canvascontext.lineTo(100+xdisplacement,160+ydisplacement);
        this.canvascontext.stroke();

        this.canvascontext.closePath();

        if(_type==="diagonal"){
            this.canvascontext.resetTransform();
        }
    }

    generateDash(identity){
        const xdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.strokeStyle = "#000";

        this.canvascontext.beginPath();

        this.canvascontext.moveTo(40+xdisplacement,100+ydisplacement);
        this.canvascontext.lineTo(160+xdisplacement,100+ydisplacement);
        this.canvascontext.closePath();

        this.canvascontext.stroke();
    }

    generateDiamond(identity){
        const xdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.strokeStyle = "#000";

        this.canvascontext.beginPath();

        this.canvascontext.moveTo(100+xdisplacement, 40+ydisplacement);
        this.canvascontext.lineTo(60+xdisplacement, 100+ydisplacement);
        this.canvascontext.lineTo(100+xdisplacement, 160+ydisplacement);
        this.canvascontext.lineTo(140+xdisplacement, 100+ydisplacement);
        this.canvascontext.lineTo(100+xdisplacement, 40+ydisplacement);
        this.canvascontext.closePath();

        this.canvascontext.stroke();
    }

    generatePentagon(identity){
        const randomx = identity ? 100 : getRandomInt(90, 110);
        const randomy = identity ? 100 : getRandomInt(90, 110);
        const randomsize = identity ? 70 : getRandomInt(60, 80);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        var numberOfSides = 5,
        size = randomsize,
        Xcenter = randomx,
        Ycenter = randomy,
        step  = 2 * Math.PI / numberOfSides,
        shift = (Math.PI / 180.0) * -18;

        this.canvascontext.beginPath();
        //cxt.moveTo (Xcenter +  size * Math.cos(0), Ycenter +  size *  Math.sin(0));          

        for(var i=0; i<=numberOfSides; i++){
            var curStep = i * step + shift;
            this.canvascontext.lineTo (Xcenter + size * Math.cos(curStep), Ycenter + size * Math.sin(curStep));
        }

        this.canvascontext.closePath();

        this.canvascontext.strokeStyle = "#000";
        this.canvascontext.lineWidth = this.linewidth;
        this.canvascontext.stroke();
    }

    generateTriangle(identity){
        const xdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.strokeStyle = "#000";
        this.canvascontext.lineWidth = this.linewidth;

        this.canvascontext.beginPath();
        this.canvascontext.moveTo(100+xdisplacement, 40+ydisplacement);
        this.canvascontext.lineTo(40+xdisplacement, 150+ydisplacement);
        this.canvascontext.lineTo(160+xdisplacement, 150+ydisplacement);
        this.canvascontext.closePath();
        this.canvascontext.stroke();
    }

    generateSquare(identity){
        const xdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const sizedisplacement = identity ? 0 : getRandomInt(0, 20);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.strokeStyle = "#000";
        this.canvascontext.lineWidth = this.linewidth;

        this.canvascontext.beginPath();

        this.canvascontext.moveTo(50+xdisplacement, 50+ydisplacement);
        this.canvascontext.lineTo(50+xdisplacement, 150+ydisplacement+sizedisplacement);
        this.canvascontext.lineTo(150+xdisplacement+sizedisplacement, 150+ydisplacement+sizedisplacement);
        this.canvascontext.lineTo(150+xdisplacement+sizedisplacement, 50+ydisplacement);
        this.canvascontext.lineTo(50+xdisplacement, 50+ydisplacement);
        this.canvascontext.closePath();
        this.canvascontext.stroke();
    }

    generateQuestionMark(identity){
        const xdisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const ydisplacement = identity ? 0 : getRandomInt(5, 10) * (getRandomInt(1, 3)===1?-1:1);
        const randomfontsize = identity ? 150 : getRandomInt(140, 160);

        const randomfont = identity ? `${randomfontsize}px Century Gothic, sans-serif` : (getRandomInt(1, 3)===1 ? `${randomfontsize}px Trebuchet MS, sans-serif` : `${randomfontsize}px Century Gothic, sans-serif`);

        this.canvascontext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvascontext.font = randomfont;
        this.canvascontext.fillText('?', 50+xdisplacement, 150+ydisplacement);
    }

}

const getRandomInt = (_min, _max)=>{
    const min = Math.ceil(_min);
    const max = Math.floor(_max);
    return Math.floor(Math.random() * (max - min) + min);
}

// fromx, fromy, tox, toy
const canvas_arrow = (context, fromx, fromy, tox, toy)=>{
    var headlen = getRandomInt(50, 60); // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

const toRadian = (degree)=>{
    return (Math.PI / 180) * degree;
}