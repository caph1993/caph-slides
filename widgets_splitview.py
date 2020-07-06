from flexx import flx
from widgets_std import MyWidget
import os

HERE = os.path.dirname(__file__)

def imports():
    sources = {
        'split.js': {
            'cdn': 'https://unpkg.com/split.js/dist/split.min.js',
            'local': ('assets_js', 'split.min.js'),
        },
    }
    for key, value in sources.items():
        if 'local' in value:
            path = os.path.join(HERE, *value['local'])
            with open(path) as f:
                content = f.read()
            flx.assets.associate_asset(__name__, key, content)
        else:
            url = value['cdn']
            print('Pulling cdn: ', url)
            flx.assets.associate_asset(__name__, url)
    return

imports()


class SBox(MyWidget):
    CSS='''
    .split {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .split-child {
        border: 1px solid #8888;
    }
    .gutter {
        background-color: transparent;
        background-repeat: no-repeat;
        background-position: 50%;
    }
    .gutter.gutter-horizontal {
        cursor: col-resize;
        background-image: url('../grips/vertical.png');
    }
    .gutter.gutter-vertical {
        cursor: row-resize;
        background-image: url('../grips/horizontal.png');
    }
    .split.split-horizontal,
    .gutter.gutter-horizontal {
        height: 100%;
        float: left;
    }
    .gutter.gutter-vertical {
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
    }
    .gutter.gutter-horizontal {
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    }
    '''
    async def split_children(self, options={}):
        global window
        while len(self.children)==0:
            await self.sleep(10)
        ids = ['#'+e.node.id for e in self.children]
        window.Split(ids, options)

class SHBox(flx.HBox):
    CSS=SBox.CSS
    async def split_children(self, options={}):
        global window, eval
        sleep = eval("(t)=>new Promise(r=>setTimeout(r, t))")
        while len(self.children)==0:
            await sleep(10)
        ids = ['#'+e.node.id for e in self.children]
        window.Split(ids, options)


class SVBox(flx.VBox):
    CSS=SBox.CSS
    async def split_children(self, options={}):
        global window, eval
        sleep = eval("(t)=>new Promise(r=>setTimeout(r, t))")
        while len(self.children)==0:
            await sleep(10)
        ids = ['#'+e.node.id for e in self.children]
        window.Split(ids, options)


class SContent(flx.Widget):
    def _create_dom(self):
        global window
        r = window.Math.random()
        r = window.Math.floor(r*1e9)
        return flx.create_element('div', {
          'class': 'split split-child',
          'id': 'split_content_'+r,
        })
