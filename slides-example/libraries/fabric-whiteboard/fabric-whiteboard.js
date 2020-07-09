
class FabricWhiteboardClass{
  constructor(){
    this.loaded = {};
    this.already = false;
    this.hidden = true;
  }
  async init(container){
    if(this.already) return;
    this.already=true;
    //if(container.tagName!='div') return;
    let dropdown = document.createElement('div', {id:'#whiteboard-main'});
    container.appendChild(dropdown);

    let main = document.createElement('div', {id:'#whiteboard-main'});
    dropdown.classList.add('whiteboard-dropdown');
    main.classList.add('whiteboard-main');
    main.innerHTML = this.controlsHTML;
    main.hidden = this.hidden;
    dropdown.addEventListener('click', ()=>{
      main.hidden = this.hidden = !this.hidden;
      if(!this.hidden) dropdown.classList.add('whiteboard-dropdown-shown');
      else dropdown.classList.remove('whiteboard-dropdown-shown');
    });
    container.appendChild(main);
    let canvas = this.whiteboard_init();
    canvas.setHeight(3*window.innerHeight);
    canvas.setWidth(3*window.innerWidth);
  }

  controlsHTML = `
  <canvas id="whiteboard-canvas" class="whiteboard-canvas"></canvas>
  <div id="whiteboard-background" class="whiteboard-background"></div>
  <div id="whiteboard-controls" class="whiteboard-controls hbox">
    <button id="clear-canvas" class="btn btn-info">Clear</button>
    <button id="drawing-mode" class="btn btn-info">Edit</button>
    <div id="drawing-mode-options" class="hbox">
      🖉
      <select id="drawing-mode-selector">
        <option>Pencil</option>
        <option>Circle</option>
        <option>Spray</option>
        <option>Pattern</option>
        <option>hline</option>
        <option>vline</option>
        <option>square</option>
        <option>diamond</option>
        <option>texture</option>
      </select>

      <input type="color" value="#005E7A" id="drawing-color">
      <input type="range" value="50" min="0" max="150" id="drawing-line-width">
      ❏
      <input type="color" value="#005E7A" id="drawing-shadow-color">
      <input type="range" value="10" min="2" max="50" id="drawing-shadow-width">

      <input hidden type="range" value="0" min="0" max="50" id="drawing-shadow-offset">
    </div>
  </div>
  `;

  add_alpha(hex_color, opacity){
    const parse = (a,b)=>parseInt(hex_color.slice(a, b), 16);
    const rgb = [[-6, -4], [-4,-2], [-2, hex_color.length]].map(([a,b])=>parse(a,b));
    const rgba = 'rgba('+rgb.join(',')+','+opacity +')';
    return rgba;
  }
  parse_stroke_width(str_width){
    const value = parseInt(str_width, 10)||1;
    const out = Math.floor(value/10 + Math.pow(6, value/50))||1;
    return out;
  }


  whiteboard_init() {
    var $ = function(id){ return document.getElementById(id); };

    var canvas = this.__canvas = new fabric.Canvas('whiteboard-canvas', {
      isDrawingMode: true
    });

    fabric.Object.prototype.transparentCorners = false;

    var drawingModeEl = $('drawing-mode'),
        drawingOptionsEl = $('drawing-mode-options'),
        drawingColorEl = $('drawing-color'),
        drawingShadowColorEl = $('drawing-shadow-color'),
        drawingLineWidthEl = $('drawing-line-width'),
        drawingShadowWidth = $('drawing-shadow-width'),
        drawingShadowOffset = $('drawing-shadow-offset'),
        clearEl = $('clear-canvas');

    const get_color = (e)=>this.add_alpha(e.value, 0.5);
    const get_width = (e)=>this.parse_stroke_width(e.value);

    clearEl.onclick = function() { canvas.clear() };

    drawingModeEl.onclick = function() {
      canvas.isDrawingMode = !canvas.isDrawingMode;
      if (canvas.isDrawingMode) {
        drawingModeEl.innerHTML = 'Draw';
        drawingOptionsEl.style.display = '';
      }
      else {
        drawingModeEl.innerHTML = 'Edit';
        drawingOptionsEl.style.display = 'none';
      }
    };

    if (fabric.PatternBrush) {
      var vLinePatternBrush = new fabric.PatternBrush(canvas);
      vLinePatternBrush.getPatternSrc = function() {

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(10, 5);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
      };

      var hLinePatternBrush = new fabric.PatternBrush(canvas);
      hLinePatternBrush.getPatternSrc = function() {

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
      };

      var squarePatternBrush = new fabric.PatternBrush(canvas);
      squarePatternBrush.getPatternSrc = function() {

        var squareWidth = 10, squareDistance = 2;

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
        var ctx = patternCanvas.getContext('2d');

        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, squareWidth, squareWidth);

        return patternCanvas;
      };

      var diamondPatternBrush = new fabric.PatternBrush(canvas);
      diamondPatternBrush.getPatternSrc = function() {

        var squareWidth = 10, squareDistance = 5;
        var patternCanvas = fabric.document.createElement('canvas');
        var rect = new fabric.Rect({
          width: squareWidth,
          height: squareWidth,
          angle: 45,
          fill: this.color
        });

        var canvasWidth = rect.getBoundingRect().width;

        patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
        rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

        var ctx = patternCanvas.getContext('2d');
        rect.render(ctx);

        return patternCanvas;
      };
      var texturePatternBrush = new fabric.PatternBrush(canvas);
    }

    $('drawing-mode-selector').onchange = function() {

      if (this.value === 'hline') {
        canvas.freeDrawingBrush = vLinePatternBrush;
      }
      else if (this.value === 'vline') {
        canvas.freeDrawingBrush = hLinePatternBrush;
      }
      else if (this.value === 'square') {
        canvas.freeDrawingBrush = squarePatternBrush;
      }
      else if (this.value === 'diamond') {
        canvas.freeDrawingBrush = diamondPatternBrush;
      }
      else if (this.value === 'texture') {
        canvas.freeDrawingBrush = texturePatternBrush;
      }
      else {
        canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
      }

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = get_color(drawingColorEl);
        canvas.freeDrawingBrush.width = get_width(drawingLineWidthEl);
        canvas.freeDrawingBrush.shadow = new fabric.Shadow({
          blur: parseInt(drawingShadowWidth.value, 10) || 0,
          offsetX: 0,
          offsetY: 0,
          affectStroke: true,
          color: this.add_alpha(drawingShadowColorEl.value, 0.5),
        });
      }
    };

    drawingColorEl.onchange = function() {
      canvas.freeDrawingBrush.color = get_color(this);
    };
    drawingShadowColorEl.onchange = function() {
      canvas.freeDrawingBrush.shadow.color = this.value;
    };
    drawingLineWidthEl.onchange = function() {
      canvas.freeDrawingBrush.width = get_width(this);
    };
    drawingShadowWidth.onchange = function() {
      canvas.freeDrawingBrush.shadow.blur = this.value;
    };
    drawingShadowOffset.onchange = function() {
      canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
      canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
      this.previousSibling.innerHTML = this.value;
    };

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = this.add_alpha(drawingColorEl.value, 0.5);
      canvas.freeDrawingBrush.width = this.parse_stroke_width(drawingLineWidthEl.value);
      canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: parseInt(drawingShadowWidth.value, 10) || 0,
        offsetX: 0,
        offsetY: 0,
        affectStroke: true,
        color: drawingShadowColorEl.value,
      });
    }

    document.addEventListener('keydown', (e)=>{
      if(this.hidden) return;
      if(e.keyCode == 46) {
        this.__canvas.getActiveObjects().forEach((obj) => this.__canvas.remove(obj));
        this.__canvas.discardActiveObject().renderAll()
      }
    });
    return canvas;
  }
}

var FabricWhiteboard = new FabricWhiteboardClass();