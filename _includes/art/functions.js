const dxy = new Array();
for(let i=0;i<8;i++){
    const theta = i*Math.PI/4;
    dxy[i]=[Math.round(Math.cos(theta)),Math.round(Math.sin(theta))];
}

const randomInt=(maxInt)=>{
    return Math.floor(Math.random()*maxInt);
}

const randBtwn=(min,max)=>{
    return min+Math.random()*(max-min);
}

const xy2i=([x,y],width)=>{
    return x+y*width;
}
const i2xy=(i,width)=>{
    return [i%width,Math.floor(i/width)];
}
const mod=(n,m)=>{
  return ((n % m) + m) % m;
}
