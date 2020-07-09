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
  for(let x of arr) if(!x) return false;
  return true;
}
function any_true(arr){
  for(let x of arr) if(x) return true;
  return false;
}
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for(let i=0; i<a.length; ++i){
    if (a[i] !== b[i]) return false;
  }
  return true;
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
    else Reveal.on('ready', (e)=> this._on_reveal_ready());
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
    try{ await this.__on_reveal_ready(); }
    finally{ Reveal.sync(); }
  }

  async __on_reveal_ready(){
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
      const elements = get_elems(css_class);
      if(!elements.length) return;

      let all_diff = (a,b) => all_true(a.map((_,i)=>a[i]!=b[i]));
      await Promise.all(elements.map(async e =>{
        let loader = document.createElement('div');
        css_loader.split(' ').map(s=>loader.classList.add(s));
        e.insertAdjacentElement('afterend', loader);
        e.hidden = true;
        return;
      }));
      
      // Wait for elements query to update (this is weird but necessary)
      const ready = () => all_diff(elements, get_elems(css_class));
      try{
        await Promise.all([
          (async ()=>{ await sleep(1500); throw 'Timeout'; })(),
          (async ()=>{ while(!ready()) await sleep(5); })(),
        ]);
      } catch(e){ if(e!='Timeout') throw e; }

      try{
        // Import scripts and styles in series (dependency order)
        if(get_elems(css_class).length){
          for(let src of styles){await this.load_style(src)};
          for(let src of scripts){await this.load_script(src)};
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


var KEY_CODES = {
  "0": 48, "1": 49, "2": 50, "3": 51, "4": 52,
  "5": 53, "6": 54, "7": 55, "8": 56, "9": 57, "backspace": 8,
  "tab": 9, "enter": 13, "shift": 16, "ctrl": 17, "alt": 18,
  "pause_break": 19, "caps_lock": 20, "escape": 27, "page_up": 33,
  "page_down": 34, "end": 35, "home": 36, "left_arrow": 37,
  "up_arrow": 38, "right_arrow": 39, "down_arrow": 40, "insert": 45,
  "delete": 46, "a": 65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70,
  "g": 71, "h": 72, "i": 73, "j": 74, "k": 75, "l": 76, "m": 77,
  "n": 78, "o": 79, "p": 80, "q": 81, "r": 82, "s": 83, "t": 84,
  "u": 85, "v": 86, "w": 87, "x": 88, "y": 89, "z": 90,
  "left_window_key": 91, "right_window_key": 92, "select_key": 93,
  "numpad_0": 96, "numpad_1": 97, "numpad_2": 98, "numpad_3": 99,
  "numpad_4": 100, "numpad_5": 101, "numpad_6": 102, "numpad_7": 103,
  "numpad_8": 104, "numpad_9": 105, "multiply": 106, "add": 107,
  "subtract": 109, "decimal_point": 110, "divide": 111,
  "f1": 112, "f2": 113, "f3": 114, "f4": 115, "f5": 116, "f6": 117,
  "f7": 118, "f8": 119, "f9": 120, "f10": 121, "f11": 122, "f12": 123,
  "num_lock": 144, "scroll_lock": 145, "semi_colon": 186,
  "equal_sign": 187, "comma": 188, "dash": 189, "period": 190,
  "forward_slash": 191, "grave_accent": 192, "open_bracket": 219,
  "back_slash": 220, "close_braket": 221, "single_quote": 222
}
