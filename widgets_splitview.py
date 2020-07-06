from flexx import flx
from widgets_std import MyWidget

#url = "https://unpkg.com/split-grid/dist/split-grid.js"
url = "https://unpkg.com/split.js/dist/split.min.js"
flx.assets.associate_asset(__name__, url)

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
        box-shadow: inset 0 1px 2px #e4e4e4;
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
