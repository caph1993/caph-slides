from flexx import flx

class MyWidget(flx.Widget):

    def init(self):
        global eval
        super().init()
        self.sleep = eval("(t)=>new Promise(r=>setTimeout(r, t))")
        self.document = eval("document")
        self.Array = eval("Array")
        self.newDate = eval("(...args)=>new Date(...args)")
        self.JSON = eval("JSON")
        self._newCircularReplacer = eval("""() => {
            //https://stackoverflow.com/a/53731154/3671939
            const seen = new WeakSet();
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) return;
                    seen.add(value);
                }
                return value;
            };
        };""")

    def new(self, obj, *args):
        global window
        return window.Reflect.construct(obj, args)

    def repr(self, obj, indent=None):
        #indent = indent and ' '*indent
        handler = self._newCircularReplacer()
        return self.JSON.stringify(obj, handler, indent)


class HTMLPreview(MyWidget):
    '''iframe with srcdoc instead of src support'''
    CSS='''
    .flx-HTMLPreview{
        border: 1px solid;
    }
    '''
    srcdoc = flx.StringProp('', settable=True)
    def _create_dom(self):
        return flx.create_element('iframe', {'srcdoc':self.srcdoc})


class FileInput(MyWidget):
    '''iframe with srcdoc instead of src support'''
    #srcdoc = flx.StringProp('', settable=True)
    def _create_dom(self):
        return flx.create_element('input', {
            'type': 'file',
            'onchange': self.emit_change,
        })

    @flx.emitter
    def emit_change(self):
      value = self.node.value
      print(value)
      return dict(value=value)

