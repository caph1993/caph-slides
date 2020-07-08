function assert(condition, message){
  if(!condition) throw new Error(message);
}

function Promise_finish_all(promises){
  // Ensures completion of all promises even if some throw exceptions
  return new Promise((ok, err)=>{
    if(promises.length==0) return ok([]);
    let any_error=false;
    let cnt = 0;
    let outs = promises.map((p)=>null);
    Promise.all(promises.map(async (p, i)=>{
      try{ outs[i] = await p; }
      catch(e){ any_error=true; outs[i] = e; }
      cnt += 1
      if(cnt==promises.length){
        if(any_error) err(outs);
        else ok(outs);
      }
    }));
  });
}

function sleep(ms){
  return new Promise((ok,err)=>setTimeout(ok, ms));
}
function all_true(arr){
  return arr.reduce(((p,c)=>p&&c), true) || false;
}
function any_true(arr){
  return arr.reduce(((p,c)=>p||c), false) && true;
}

async function DOM_insert_after(new_element, element){
  const parent = element.parentNode;
  new_element.id = new_element.id || '#new_elem'+Math.random();
  element.insertAdjacentElement('afterend', new_element);
  
  await sleep(300); // I NEED A BETTER CODE HERE...
  // Wait until the selector for element is 'stable'

}

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
      await sleep(1500);
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
    const get_elems = (s)=>[...document.getElementsByClassName(s)];
    const custom_parsers = Reveal.getConfig().custom_parsers;
    await Promise_finish_all(custom_parsers.map(async (p)=>{
      // Get all elements of the class
      const css_class = p.css_class;
      const scripts = p.scripts || [];
      const styles = p.styles || [];
      const parser = p.parser || ((_)=>console.log('No parser for', css_class));
      
      // Create loaders in DOM
      const css_loader = 'parser-loading tmp-'+css_class;
      let elements = get_elems(css_class);

      let ploaders = []
      await Promise.all(elements.map(async e =>{
        let loader = document.createElement('div');
        css_loader.split(' ').map(s=>loader.classList.add(s));
        await DOM_insert_after(loader, e);
        e.hidden = true;
        return;
      }));
      
      try{
        // Import scripts and styles
        if(get_elems(css_class).length){
          await Promise.all(styles.map(src=> this.load_style(src)));
          await Promise.all(scripts.map(src=> this.load_script(src)));
        }
        // Run parser functions and clear loaders
        await Promise_finish_all(get_elems(css_class).map(async (e) =>{
          try{
            await parser(e);
          } finally {
            e.hidden=false;
            get_elems(css_loader).forEach(x=>x==e.nextSibling?x.remove():null);
          }
        }));
      } finally{
        // Remove possible remaining loaders and unhide possible hidden 
        // This may happen because of the 'liveness' of get_elems
        get_elems(css_loader).forEach(e=>e.remove());
        //get_elems(css_class).forEach(e=>e.hidden=false);
      }
    }));
  }
}
