class Artist {
    constructor(width, height, temperature, humidity, percipitationChance, windSpeed) {
        this.width = width;
        this.height = height;
        this.area = this.width * this.height;
        this.temperature = temperature;
        this.humidity = humidity;
        this.percipitationChance = percipitationChance;
        this.windSpeed = windSpeed;
        this.isPixelColored = new Array(this.area).fill(false);
        this.pixelToPaint = randomInt(this.area);
        this.pixelToMoveFrom = randomInt(this.area);
        this.rgbIndex = randomInt(2);
        this.colorCounter = 0;
        this.colorIncrement = [1,1,1]; //r g b
        this.pixelChangePercent = 1/randomInt(1000);
        this.pixelLocHist = [];
        this.colMax = [randomInt(256),randomInt(256),randomInt(256)];
        this.colMin = [randomInt(256),randomInt(256),randomInt(256)];
        for(let iclr=0; iclr<3; iclr++){
            if(this.colMax[iclr] < this.colMin[iclr]){
              let temp = this.colMin[iclr];
              this.colMin[iclr] = this.colMax[iclr];
              this.colMax[iclr] = temp;
              if((this.colMax[iclr] - this.colMin[iclr])<20){
                this.colMax[iclr]=Math.min(this.colMax[iclr]+10,255);
                this.colMin[iclr]=Math.max(this.colMin[iclr]-10,0);
                
              }
            }
        }
        this.pixelColor = [randBtwn(this.colMin[0],this.colMax[0]), randBtwn(this.colMin[1],this.colMax[1]), randBtwn(this.colMin[2],this.colMax[2])]; // r g b 

    }
    
    // resets to draw another picture
    reset() {
      for (let ipx = 0; ipx<this.area; ipx++){
        this.isPixelColored[ipx] = false;
      }
      this.pixelToPaint = randomInt(this.area);
      this.pixelToMoveFrom = randomInt(this.area);
      this.colMax = [randomInt(256),randomInt(256),randomInt(256)];
      this.colMin = [randomInt(256),randomInt(256),randomInt(256)];
      for(let iclr=0; iclr<3; iclr++){
          if(this.colMax[iclr] < this.colMin[iclr]){
            let temp = this.colMin[iclr];
            this.colMin[iclr] = this.colMax[iclr];
            this.colMax[iclr] = temp;
            if((this.colMax[iclr] - this.colMin[iclr])<20){
              this.colMax[iclr]=Math.min(this.colMax[iclr]+10,255);
              this.colMin[iclr]=Math.max(this.colMin[iclr]-10,0);
              
            }
          }
      }
      //this.pixelColor = [randBtwn(this.colMin[0],this.colMax[0]), randBtwn(this.colMin[1],this.colMax[1]), randBtwn(this.colMin[2],this.colMax[2])]; // r g b 
      console.log(this.colMax);
      console.log(this.colMin);
    }

    changePixel() {
        this.changePixelLocation2();
        this.changePixelColor2();
    }

    changePixelLocation() {
        
        const [previousX, previousY] = i2xy(this.pixelToMoveFrom, this.width)
        if (this.isPixelColored.every(Boolean)) return;

        let relativeX;
        let relativeY;
        let newX;
        let newY;
        let maxPixelAway = 1;

        while (this.isPixelColored[this.pixelToPaint]) {

            let circumference = maxPixelAway * 8;
            let circumIndex = randomInt(circumference);
            let circumCounter = 0;

            while (circumCounter < circumference && this.isPixelColored[this.pixelToPaint]) {

                [relativeX, relativeY] = this.convertRadInd2XY(circumIndex, maxPixelAway, circumference);
                newX = Math.max(previousX + relativeX, 0);
                newY = Math.max(previousY + relativeY, 0);
                newX = Math.min(newX, this.width);
                newY = Math.min(newY, this.height);
                this.pixelToPaint = xy2i([newX, newY], this.width);

                circumIndex = (circumIndex + 1) % circumference;
                circumCounter++;

            }

            maxPixelAway++;

        }
        if (Math.random()<this.pixelChangePercent){
            this.pixelToMoveFrom = this.pixelToPaint;
            this.pixelChangePercent = 1 / randomInt(3000)
        }
    }

    convertRadInd2XY(index, maxPixelAway, totalPixels) {
        let diameter = maxPixelAway * 2 + 1;
        let relativeY;
        let relativeX;
        if (index < diameter) {
            relativeY = - maxPixelAway;
            relativeX = index - maxPixelAway;
        } else if (index < (totalPixels - diameter)) {
            relativeX = maxPixelAway * (-1) ** index;
            relativeY = Math.floor((index - diameter) / 2) - maxPixelAway + 1;
        } else if (index < totalPixels) {
            relativeY = maxPixelAway;
            relativeX = index - totalPixels + maxPixelAway + 1;
        }
        return [relativeX, relativeY];
    }

    changePixelColor(){
        let randomColor = randomInt(2);
        let maxColorDif = 10;
        if (Math.abs(this.pixelColor[this.rgbIndex] - 
          this.pixelColor[(this.rgbIndex+1)%3])>maxColorDif || 
          Math.abs(this.pixelColor[this.rgbIndex] - 
          this.pixelColor[(this.rgbIndex+2)%3])>maxColorDif){
            this.rgbIndex = (this.rgbIndex + randomColor) % 3;
        }
            
        let changeValue = 1 + Math.random()*2;
        let whichrgb = 0;

        this.pixelColor[(this.rgbIndex+whichrgb)%3] = this.pixelColor[(this.rgbIndex+whichrgb)%3] + this.colorIncrement[(this.rgbIndex+whichrgb)%3];

        if (this.pixelColor[(this.rgbIndex+whichrgb)%3] >= 255 || this.pixelColor[(this.rgbIndex+whichrgb)%3] <=0)
            this.colorIncrement[(this.rgbIndex+whichrgb)%3] *= -1;


    }

    drawPixel(fieldImgData) {
        if (this.isPixelColored[(this.pixelToPaint+1)%this.area]){
        //    fieldImgData.data[this.pixelToPaint * 4 + 0] = (fieldImgData.data[(this.pixelToPaint+1) * 4 + 0] + this.pixelColor[0])/2;
        //    fieldImgData.data[this.pixelToPaint * 4 + 1] = (fieldImgData.data[(this.pixelToPaint+1) * 4 + 1] + this.pixelColor[1])/2;
        //    fieldImgData.data[this.pixelToPaint * 4 + 2] = (fieldImgData.data[(this.pixelToPaint+1) * 4 + 2] + this.pixelColor[2])/2;
        }else{

        
        }
        fieldImgData.data[this.pixelToPaint * 4 + 0] = this.pixelColor[0];
        fieldImgData.data[this.pixelToPaint * 4 + 1] = this.pixelColor[1];
        fieldImgData.data[this.pixelToPaint * 4 + 2] = this.pixelColor[2];



        this.isPixelColored[this.pixelToPaint] = true;
    }

    changePixelLocation2(){
      let prevLoc = this.pixelToPaint;
      this.pixelLocHist.unshift(prevLoc);
      if(this.pixelLocHist.length>1) this.pixelLocHist.pop();
      let calcpointX = 0;
      let calcpointY = 0;
      [calcpointX, calcpointY] = i2xy(prevLoc,this.width);
      //for(let ihist=0; ihist<this.pixelLocHist.length; ihist++){
      //  let tempXY =  i2xy(this.pixelLocHist[ihist],this.width);
      //  calcpointX += tempXY[0];
      //  calcpointY += tempXY[1];
      //}
      //console.log("length: " + this.pixelLocHist.length);
      //calcpointX= Math.round(calcpointX/this.pixelLocHist.length);
      //calcpointY= Math.round(calcpointY/this.pixelLocHist.length);
      let newXY = [calcpointX, calcpointY]; 
      //console.log(newXY);
      newXY[0] += Math.floor(Math.random()*3 - 1);
      newXY[1] += Math.floor(Math.random()*3 - 1);
      let newLoc = xy2i(newXY, this.width);
      let maxPixelAway = 1;
      let circumIndex = randomInt(8);
      let circumCounter = 0;
      while(this.isPixelColored[newLoc]){
        let circumference = maxPixelAway * 8;
        let [relativeX, relativeY] = this.convertRadInd2XY(circumIndex, maxPixelAway, circumference); 
        const newNewXY = [newXY[0]+relativeX, 
                          newXY[1]+relativeY];
        newLoc = mod((xy2i(newNewXY, this.width)),this.area);
        circumCounter++;
        circumIndex = mod(circumIndex+1,circumference);
        //console.log("circ: " + circumference);
        //console.log("circC: " + circumCounter++);
        if (circumCounter>=circumference){
          circumCounter=0;
          maxPixelAway++;
          //console.log("rad: " + maxPixelAway);
          circumIndex=randomInt(maxPixelAway * 8);
        }
      }
      //console.log(this.pixelToPaint)
      //console.log(i2xy(newLoc,this.width));
      this.pixelToPaint = newLoc;
    }


    changePixelColor2(){
      //this.pixelColor = [255, 255, 255];
      //return;
      const oldColor = this.pixelColor;
      let changeProb = 0.5;
      let changeMaxAmount = 5; 
      for (let iclr=0; iclr<3; iclr++){
        if (Math.random()<changeProb){
          this.pixelColor[iclr] += Math.floor(Math.random()*changeMaxAmount)
          *(-1)**Math.floor(Math.random()*2); 
          if (this.pixelColor[iclr] > this.colMax[iclr])  this.pixelColor[iclr] = this.colMax[iclr];
          if (this.pixelColor[iclr] < this.colMin[iclr])  this.pixelColor[iclr] = this.colMin[iclr];
        }
      }
    }


}
