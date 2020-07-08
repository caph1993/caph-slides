class SlidesCore{
  constructor(dist='libraries/reveal.js/dist/'){
    this.loaded = {};
    this.dist = dist;
    this.load_style(dist+'reset.css');
    this.load_style(dist+'reveal.css');
    this.already = false;
    window.addEventListener('load', ()=>this._init())
  }

  async _init(){
    if(this.already) return;
    this.already = true;
    await this.load_script(this.dist+'reveal.js');
    if(Reveal.isReady()) this._on_reveal_ready();
    else Reveal.on('ready', (e)=>this._on_reveal_ready());
    this.init();
  }
  
  async init(){
    console.warn('No initialization arguments specified.');
    Reveal.initialize({});
  }

  __load_elem(parent, tag, attrs={}){
    return new Promise((ok, err)=>{
      let e = document.createElement(tag);
      e.onload = ()=>ok();
      e.onerror = ()=>err(); // HTTP errors only
      Object.keys(attrs).map(key =>
        e.setAttribute(key, attrs[key])
      );
      parent.appendChild(e);
    });
  };
  async sleep(ms){
    return new Promise((ok,err)=>setTimeout(ok, ms));
  }

  async _load_elem(ref, parent, tag, attrs={}){
    // Handle concurrent calls to load_elem(...) about the same ref
    if(!this.loaded[ref]){
      this.loaded[ref]=1;
      try{
        await this.__load_elem(parent, tag, attrs);
        this.loaded[ref]=2;
      } catch(err){
        this.loaded[ref]=0;
        throw err;
      }
    }
    while(this.loaded[ref]==1){
      await this.sleep(1500);
    }
  }

  async load_script(src){
    await this._load_elem(src, document.body, 'script', {src: src});
  };

  async load_style(href, id=null){
    let attrs = { href: href, rel:'stylesheet', type:'text/css'};
    if(id) attrs.id = id;
    await this._load_elem(href, document.head, 'link', attrs);
  };

  async _on_reveal_ready(){
    // Parse custom css_classes
    let get_elems = (s)=>[...document.getElementsByClassName(s)];
    let custom_parsers = Reveal.getConfig().custom_parsers;
    await Promise.all(custom_parsers.map(async (p)=>{
      // Get all elements of the class
      let css_class = p.css_class;
      let scripts = p.scripts || [];
      let styles = p.styles || [];
      let parser = p.parser || ((_)=>console.log('No parser for', css_class));
      let css_loader = 'parser-loading tmp-'+css_class;
      get_elems(css_class).map(e =>{
        let loader = document.createElement('div');
        css_loader.split(' ').map(s=>loader.classList.add(s));
        e.parentNode.insertBefore(loader, e.nextSibling);
        loader.hidden=false;
        e.hidden = true;
        return loader;
      });
      if(get_elems(css_class).length){
        await Promise.all(styles.map(src=> this.load_style(src)));
        await Promise.all(scripts.map(src=> this.load_script(src)));
      }
      await Promise.all(get_elems(css_class).map(async (e) =>{
        try{
          await parser(e);
        } finally {
          get_elems(css_loader).forEach(l=>l==e.nextSibling?l.remove():null);
          e.hidden=false;
        }
      }));
      get_elems(css_loader).forEach(l=>l.remove());
    }));
  }
}
