/**
 * @name        Box
 * @version     1.0.0
 * @author      rebelliume <rebelliume@gmail.com>
 * @contact     rebelliume
 * @copyright   rebelliume
 * @license     MIT
 * @released    2025/05/04
 * 
 * @requires    selector.js
 * 
 * @returns {object}
 */

(function() {

    if (typeof window.$ID !== 'function') {
        console.error('selector.js is missing');

        return;
    }

    window['$BOX'] = function(config) {
        return new Box(config);
    };
})();

function Box(config = {}) {
    const defaults = {
        element: 'box',
        title: '',
        height: '200px',
        width: '400px',
        opacity: 0.75,
        fgColor: '#ffffff',
        bgColor: '#000000',
        tlColor: '#121212',
        fontName: 'Arial',
        fontSize: 12,    
        disposable: true,
        minimizable: true,
        movable: false,
        selectable: true,
        resizable: false,
        resizeAxis: ['x', 'y']
    };

    const settings = { ...defaults, ...config };

    const hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    
    const random = (length) => {
        if(!length) { $ERROR('require args'); }

        if(!$TYPE(length, 'number')) { $ERROR('arg type mismatch'); }

        let result = [];

        result.push(hex[Math.floor(Math.random() * (6) + 10)]);

        for (let n = 1; n < length; n++) {
            result.push(hex[Math.floor(Math.random() * 16)]);
        }
        
        return result.join('');
    };

    const titleID = random(8);
    const bodyID = random(8);
    const clsButton = random(8);
    const minButton = random(8);

    const hexRGB = (value) => {
        if(!value) { $ERROR('require args'); }

        if(!$TYPE(value, 'string')) { $ERROR('arg type mismatch'); }

        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);

        if (!result) $ERROR('invalid hex color');

        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
    };

    $ID(config.element).HTML('');

    const winTitle = $CREATE('div');
    const winBody = $CREATE('div');
    const boxStyle = $CREATE('div');

    boxStyle.innerHTML = `
        #${bodyID}::-webkit-scrollbar { width: 3px; }
        #${bodyID}::-webkit-scrollbar-track { background-color: rgba(66, 66, 66, 0.3); }
        #${bodyID}::-webkit-scrollbar-thumb { background-color: rgba(129, 129, 129, 0.79); }
        #${bodyID}::-webkit-scrollbar-thumb:hover { background-color: rgba(150, 150, 150, 0.79); }
        #${bodyID} { scrollbar-width: thin; scrollbar-color: rgba(129, 129, 129, 0.79) rgba(66, 66, 66, 0.3); }
        #${settings.element}::selection { background-color: rgba(152, 152, 152, 0.79); }
    `;
    document.head.appendChild(boxStyle);

    $ID(settings.element).ATTR('style', `
        display: block;
        width: ${settings.width};
        height: ${settings.height};
        min-width: 200px;
        min-height: 90px;
        max-height: ${settings.height};
        color: ${settings.fgColor};
        font-size: ${settings.fontSize}px;
        font-family: ${settings.fontName};
        z-index: 1;
        border: 4px solid ${settings.tlColor};
        top: 0px;
        left: 0px;
        margin: 0 auto;
        margin-top: 5px;
        border-radius: 8px;
        position: relative;
    `);

    $OBJ(winTitle).ATTR('style', `
        width: 98.5%;
        height: 18px;
        padding-left: 1.5%;
        padding-top: 4px;
        background-color: ${settings.tlColor};
        color: ${settings.fgColor};
        font-size: 13px;
        font-weight: 100;
        line-height: 16px;
        z-index: 2;
        user-select: none;
        -ms-user-select: none;
        -webkit-user-select: none;
    `);
    $OBJ(winTitle).ATTR('id', titleID);
    $OBJ(winTitle).TEXT(settings.title);

    $OBJ(winBody).ATTR('style', `
        display: block;
        width: 100%;
        height: calc(100% - 22px);
        border-bottom-right-radius: 4px;
        border-bottom-left-radius: 4px;
        background-color: rgba(${hexRGB(settings.bgColor)}, ${settings.opacity});
        z-index: 1;
        overflow: hidden;
        ${!settings.selectable ?
        `user-select: none;
        -ms-user-select: none;
        -webkit-user-select: none;` : ''}
    `);

    if(!settings.selectable) {
        $OBJ(winBody).ATTR('style', `
            display: block;
            width: 100%;
            height: calc(100% - 22px);
            border-bottom-right-radius: 4px;
            border-bottom-left-radius: 4px;
            background-color: rgba(${hexRGB(settings.bgColor)}, ${settings.opacity});
            z-index: 1;
            overflow: auto;
            user-select: none;
            -ms-user-select: none;
            -webkit-user-select: none;
        `);
    }
    else {
        $OBJ(winBody).ATTR('style', `
            display: block;
            width: 100%;
            height: calc(100% - 22px);
            border-bottom-right-radius: 4px;
            border-bottom-left-radius: 4px;
            background-color: rgba(${hexRGB(settings.bgColor)}, ${settings.opacity});
            z-index: 1;
            overflow: auto;
        `);
    }

    $OBJ(winBody).ATTR('id', bodyID);

    $ID(settings.element).append(winTitle, winBody);

    const controls = $CREATE('div');
    $OBJ(controls).ATTR('style', `
        position: absolute;
        right: 6px;
        top: 2px;
        display: block;
        float: right;
    `);

    if (settings.disposable) {
        const closeBtn = $CREATE('div');
        $OBJ(closeBtn).ATTR('style', `
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: ${settings.fgColor};
            opacity: 0.5;
            display: inline-block;
            float: right;
            margin-left: 6px;
            transition: background-color 0.2s;
        `);
        $OBJ(closeBtn).ATTR('id', clsButton);

        controls.appendChild(closeBtn);
    }
    if (settings.minimizable) {
        const minimizeBtn = $CREATE('div');
        $OBJ(minimizeBtn).ATTR('style', `
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: ${settings.fgColor};
            opacity: 0.5;
            display: inline-block;
            float: right;
            transition: background-color 0.2s;
        `);
        $OBJ(minimizeBtn).ATTR('id', minButton);
        
        controls.appendChild(minimizeBtn);
    }

    winTitle.appendChild(controls);

    if (settings.disposable) {
        $ID(clsButton).onmouseover = () => {
            $ID(clsButton).ATTR('style', $ID(clsButton).ATTR('style').replace(/background-color: [^;]+/, `background-color: rgb(252, 51, 51)`));
        };
        $ID(clsButton).onmouseout = () => {
            $ID(clsButton).ATTR('style', $ID(clsButton).ATTR('style').replace(/background-color: [^;]+/, `background-color: ${settings.fgColor}`));
        };
        $ID(clsButton).onclick = () => {
            $ID(settings.element).HTML('');
            $ID(settings.element).ATTR('style', ``);
        };
    }

    if (settings.minimizable) {
        $ID(minButton).onmouseover = () => {
            $ID(minButton).ATTR('style', $ID(minButton).ATTR('style').replace(/background-color: [^;]+/, `background-color: rgb(214, 214, 214)`));
        };
        $ID(minButton).onmouseout = () => {
            $ID(minButton).ATTR('style', $ID(minButton).ATTR('style').replace(/background-color: [^;]+/, `background-color: ${settings.fgColor}`));
        };
        $ID(minButton).onclick = () => {
            const element       = $ID(settings.element);
            const elementBody       = $ID(bodyID);

            const currentDisplay    = elementBody.ATTR('style').includes('display: none') ? 'block' : 'none';

            const currentminHeight    = elementBody.ATTR('style').includes('display: none') ? '90px' : '22px';
            const currentHeight    = elementBody.ATTR('style').includes('display: none') ?  `${settings.height}` : '22px';
            
            elementBody.ATTR('style', elementBody.ATTR('style').replace(/display: [^;]+/, `display: ${currentDisplay}`));

            element.ATTR('style', element.ATTR('style').replace(/min-height: [^;]+/, `min-height: ${currentminHeight}`));
            element.ATTR('style', element.ATTR('style').replace(/height: [^;]+/, `height: ${currentHeight}`));
        };
    }

    if (settings.movable) {
        const element = $ID(settings.element);        
        let isDragging = false;
        let offsetX = 0,
            offsetY = 0;
        

        element.ATTR('style', element.ATTR('style').replace(/position: [^;]+/, `position: absolute`));

        element.onmousedown = (e) => {
            if(e.which != 1) {
                return;
            }

            e.preventDefault();
            
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            isDragging = true;

            $OBJ(document).ADDEVENT('mouseup', closeDragElement);
            $OBJ(document).ADDEVENT('mousemove', elementDrag);
        }

        function elementDrag(e) {
            if (!isDragging) return;

            e.preventDefault();

            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;

            console.log(newLeft);

            element.ATTR('style', element.ATTR('style'). replace(/left: [^;]+/, `left: ${newLeft - 400}px`));
            element.ATTR('style', element.ATTR('style').replace(/top: [^;]+/, `top: ${newTop}px`));
        }

        function closeDragElement() {
            isDragging = false;
            
            $OBJ(document).REMEVENT('mouseup', closeDragElement);
            $OBJ(document).REMEVENT('mousemove', elementDrag);
        }
    }

    if (settings.resizable) {
        const element = $ID(settings.element);

        let isResizing = false;
        let resizeStartX, resizeStartY, startWidth, startHeight;
    
        const resizeHandle = $CREATE('div');
        $OBJ(resizeHandle).ATTR('style', `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 10px;
            height: 10px;
            background-color: ${settings.tlColor};
            cursor: ${settings.resizeAxis.includes('x') && settings.resizeAxis.includes('y') ? 'se-resize' : settings.resizeAxis.includes('x') ? 'e-resize' : 's-resize'};
            z-index: 3;
        `);
        element.appendChild(resizeHandle);
    
        resizeHandle.onmousedown = (e) => {
            e.preventDefault();
            isResizing = true;

            resizeStartX = e.clientX;
            resizeStartY = e.clientY;

            startWidth = parseInt(settings.width, 10);
            startHeight = parseInt(settings.height, 10);
    
            $OBJ(document).ADDEVENT('mousemove', resizeElement);
            $OBJ(document).ADDEVENT('mouseup', stopResize);
        };
    
        function resizeElement(e) {
            if (!isResizing) return;
            e.preventDefault();
        
            const minWidth = parseInt(defaults.width, 10);
            const minHeight = parseInt(defaults.height, 10);

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (settings.resizeAxis.includes('x')) {
                newWidth = startWidth + (e.clientX - resizeStartX);
            }
            if (settings.resizeAxis.includes('y')) {
                newHeight = startHeight + (e.clientY - resizeStartY);
            }
        
            if (newWidth >= minWidth) {
                element.ATTR('style', element.ATTR('style').replace(/width: [^;]+/, `width: ${newWidth}px`));
            }
            if (newHeight >= minHeight) {
                element.ATTR('style', element.ATTR('style').replace(/height: [^;]+/, `height: ${newHeight}px`));
                element.ATTR('style', element.ATTR('style').replace(/max-height: [^;]+/, `max-height: ${newHeight}px`));
            }
        }
    
        function stopResize() {
            isResizing = false;
            $OBJ(document).REMEVENT('mousemove', resizeElement);
            $OBJ(document).REMEVENT('mouseup', stopResize);
        }
    }

    return { bodyID: bodyID, bodyTitle: titleID };
}