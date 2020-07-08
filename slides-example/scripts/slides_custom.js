
class SlidesClass extends SlidesCore{

  async init(){
    let path = 'libraries/reveal.js/';
    await this.load_script(path+'plugin/notes/notes.js');
    await this.load_script(path+'plugin/markdown/markdown.js');
    await this.load_script(path+'plugin/highlight/highlight.js');

    Reveal.initialize({
      progress: true,
      history: true,
      center: true,
      //width: '100%', height: '100%', hash: true,
      transition: 'none', // none/fade/slide/convex/concave/zoom
      plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ],
      dependencies: [
          {
            src: 'libraries/reveal.js-math-katex-plugin/math-katex.js',
            async: true,
          },
      ],
      math:{
        katexScript:     'libraries/katex/katex.min.js',
        katexStylesheet: 'libraries/katex/katex.min.css'
      },
      custom_parsers: [ // Scripts are not loaded if not used :)
        {
          css_class: "random-bit",
          scripts: [],
          styles: [],
          parser: async (c)=>(await this.parse_random_bit(c)),
        },
        {
          css_class: "graphviz",
          parser: async (c)=>(await this.parse_graphviz(c)),
          scripts: [
            'libraries/viz/viz.js',
            'libraries/viz/full.render.js',
          ],
        },
        {
          css_class: "fabric",
          parser: async (c)=>(await this.parse_fabric(c)),
          scripts: [
            'libraries/fabric/fabric.js',
          ],
        },
        {
          css_class: "d3",
          parser: async (c)=>(await this.parse_d3(c)),
          scripts: [
            'libraries/d3/d3.v5.min.js',
          ],
        },
      ]
    });
  }
  async parse_random_bit(container){
    await sleep(100+500*Math.random());
    let bit=Math.trunc(Math.random()*2)
    container.innerText = ''+bit;
    //console.log(container);
  }
  async parse_graphviz(container){
    let text = container.innerText;
    container.innerHTML = 'Loading diagram...';
    let viz = new Viz();
    let elem = await viz.renderSVGElement(text);
    container.replaceWith(elem);
  }
  async parse_fabric(container){
    if(container.tagName!='SCRIPT') return;
    assert(container.id!=null, 'Your script must have an id!');
    let f_name = 'fabric_'+container.id;
    let f = window[f_name];
    assert(f && container.text.search(f_name)!=-1,
      'Expected function '+f_name+' no found in script of #'+container.id);
    let canvas = document.createElement('canvas');
    container.parentNode.insertBefore(canvas, container.nextSibling);
    container.classList.forEach(s=>canvas.classList.add(s))
    let fabric_canvas = new fabric.Canvas(canvas);
    return await f(fabric_canvas);
  }
  async parse_d3(container){
    if(container.tagName!='SCRIPT') return;
    assert(container.id!=null, 'Your script must have an id!');
    let f_name = 'd3_'+container.id;
    let f = window[f_name];
    assert(f && container.text.search(f_name)!=-1,
      'Expected function '+f_name+' no found in script of #'+container.id);
    let div = document.createElement('div');
    container.parentNode.insertBefore(div, container.nextSibling);
    container.classList.forEach(s=>div.classList.add(s))
    let d3_div = d3.select(div);
    return await f(d3_div);
  }

}

Slides = new SlidesClass('libraries/reveal.js/dist/');
