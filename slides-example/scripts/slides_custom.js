
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
      custom_parsers:[
        {
          css_class: "random-bit",
          scripts: [],
          styles: [],
          parser: (c)=>this.parse_random_bit(c),
        },
        {
          css_class: "graphviz",
          parser: (c)=>this.parse_graphviz(c),
          scripts: [
            'libraries/viz.js/viz.js',
            'libraries/viz.js/full.render.js',
          ],
        },
      ]
    });
  }
  parse_random_bit(container){
    container.innerHTML = Math.trunc(Math.random()*2); 
  }
  async parse_graphviz(container){
    let text = container.innerText;
    container.innerHTML = 'Loading diagram...';
    let viz = new Viz();
    let elem = await viz.renderSVGElement(text);
    container.replaceWith(elem);
  }

}

Slides = new SlidesClass('libraries/reveal.js/dist/');
