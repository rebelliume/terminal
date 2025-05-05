/**
 * @name        Terminal
 * @version     1.0.0
 * @author      rebelliume <rebelliume@gmail.com>
 * @contact     rebelliume
 * @copyright   rebelliume
 * @license     MIT
 * @released    2025/05/05
 * 
 * @requires    selector.js
 * @requires    box.js
 * 
 * @returns {object}
 */

(function() {

    if (typeof window.$ID !== 'function') {
        console.error('selector.js is missing');

        return;
    }
    if (typeof window.$BOX !== 'function') {
        console.error('box.js is missing');

        return;
    }
})();

class terminal {
    #commands           = new Map();
    #commandsHelp       = new Map();
    #commandsInstruct   = new Map();
    #commandsHistory    = new Array();
    #lineID             = new Map();
    #historyIndex       = 0;
    #element            = null;
    #hex                = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    #returnOutput       = false;
    #outputString       = '';
    #waitInput          = false;
    #waitPrivateInput   = false;
    #privateDate        = '';  
    #privateKeyStore    = '';
    #upTime             = new Date();
    
    #settings = {
        title :         null,
        path :          null,
        user :          null,
        height :        null,
        width :         null,
        opacity :       null,
        fgColor :       null,
        bgColor :       null,
        fontName :      null,
        fontSize :      null,
        dateOption :    null,
        typeMode :      null,
        readOnly :      null,
        disposable:     null,
        minimizable:    null,
        movable:        null,
        resizable:      null
    };


    #hexID = {
        title:  this.#random(8),
        body:   this.#random(8),
        text:   this.#random(8),
        input:  this.#random(8)
    }

    /**
     *  @param {string} Title
     *  @param {string} Path
     *  @param {string} User
     *  @param {string} Height
     *  @param {string} Width
     *  @param {number} Opacity
     *  @param {string} Foreground Color
     *  @param {string} Background Color
     *  @param {string} Title Color
     *  @param {string} Font Name
     *  @param {number} Font Size
     *  @param {boolean} Date Option
     *  @param {boolean} Type Mode
     *  @param {boolean} Read Only
     *  @param {boolean} Disposable
     *  @param {boolean} Minimizable
     *  @param {boolean} Movable
     *  @param {boolean} Resizable
     */
    constructor(config = {}) {
        const defaults = {
            element: 'terminal',
            title: 'Terminal',
            path: '/',
            user: 'default',
            height: '200px',
            width: '400px',
            opacity: 0.75,
            fgColor: '#ffffff',
            bgColor: '#000000',
            tlColor: '#121212',
            fontName: 'Lucida Console',
            fontSize: 11,
            dateOption: false,
            typeMode: false,
            readOnly: false,
            disposable: true,
            minimizable: true,
            movable: false,
            resizable: false
        };

        this.#settings = { ...defaults, ...config };

        this.#element       = this.#settings.element;

        this.#upTime = new Date();

        if (this.constructor === terminal) {
            if($ID(this.#element) instanceof HTMLDivElement) {
                if ((this.constructor.prototype != terminal.prototype) == false) {
                    this.#create();
                }
            }
            else {
                $ERROR('Element Not Implemented');
            }
        }
    }

    /**
     *  @param {string} Hex
     *  @return {string} RGB
     */
    #hexRGB() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }

        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(arguments[0]);

        result = {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        }
        return result = `${result.r}, ${result.g}, ${result.b}`;
    }

    /**
     *  @param {number} Lenght
     *  @return {string} Random Hex
     */
    #random() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'number')) { $ERROR('arg type mismatch'); return; }

        let result = [];

        result.push(this.#hex[Math.floor(Math.random() * (6) + 10)]);

        for (let n = 1; n < arguments[0]; n++) {
            result.push(this.#hex[Math.floor(Math.random() * 16)]);
        }
        return result.join('');
    }

    /**
     *  @param {string} Command
     *  @return {array} Arguments
     */
    #split() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }
    
        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }
    
        let output = [],
            current = null,
            holder = '',
            quote = false,
            quoteType = null;
    
        function push() {
            if (holder.slice(-1) === quoteType) {
                holder = holder.slice(0, -1);
            }
            output.push(holder);
            holder = '';
            quoteType = null;
        }
    
        for (let loop = 0; loop < arguments[0].length; loop++) {
            current = arguments[0].charAt(loop);
    
            if (current === '"' || current === "'" || current === "`") {
                if (!quote) {
                    quote = true;
                    quoteType = current;
                } else if (current === quoteType) {
                    quote = false;
                }
            }
    
            if (quote && current !== quoteType) {
                holder += current;
            } else if (!quote && current !== ' ') {
                holder += current;
            }
    
            if (!quote && current === ' ') {
                push();
            } else if (loop === arguments[0].length - 1) {
                push();
            }
        }
    
        return output;
    }

    /**
     *  @param {string} Element
    */
    create() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'object')) { $ERROR('arg type mismatch'); return; }

        this.#create(arguments[0]);
    }

    #create() {
        let BoxID           = null,
            terminal_text   = $CREATE('div'),
            terminal_input  = $CREATE('span'),
            terminal_style  = $CREATE('style');
            
        if (arguments[0] != null) {
            BoxID = $BOX(arguments[0]);
        }
        else {
            BoxID = $BOX(this.#settings);
        }

        this.#hexID.body = BoxID.bodyID;
        this.#hexID.title = BoxID.bodyTitle;

        terminal_style.innerHTML = `
            #${this.#hexID.input}::before{ content: '$'; color: #999999; }
            #${this.#hexID.input}:focus{ animation: blink 1s step-end infinite; }
            @keyframes blink { from, to { border-color: transparent; } 50% { border-color: #ffffff; } }
            #${this.#hexID.text}::-webkit-scrollbar { width: 3px; }
            #${this.#hexID.text}::-webkit-scrollbar-track { background-color: rgba(66, 66, 66, 0.3); }
            #${this.#hexID.text}::-webkit-scrollbar-thumb { background-color: rgba(129, 129, 129, 0.79); }
            #${this.#hexID.text}::-webkit-scrollbar-thumb:hover { background-color: rgba(150, 150, 150, 0.79); }
            #${this.#hexID.text} { scrollbar-width: thin; scrollbar-color: rgba(129, 129, 129, 0.79) rgba(66, 66, 66, 0.3);}
            #${this.#element}::selection { background-color: rgba(152, 152, 152, 0.79); }`;
        document.head.appendChild(terminal_style);

        $OBJ(terminal_text).ATTR('style', `
            display: inline-block;
            width: 98%;
            height: auto;
            min-width: 0px;
            float: left;
            max-width: 98%;
            max-height: calc(100% - 20px);
            font-size: ${this.#settings.fontSize}px;
            white-space: normal;
            margin-top: 3px;
            resize: none;
            padding-left: 1%;            
            background-color: rgba(0, 0, 0, 0);
            color: white;
            border: none;
            border-right: 0px solid transparent;
            overflow-x: hidden;
            overflow-y: visible;
            caret-color: transparent;
            outline: none;
            z-index: 1;
            text-align: left;
            line-break: anywhere;
            word-break: normal;
        `);
        $OBJ(terminal_text).ATTR('id', this.#hexID.text);

        $OBJ(terminal_input).ATTR('style', `
            display: inline-block;
            width: auto;
            height: auto;
            min-width: 6px;
            float: left;
            max-width: 97%;
            font-size: ${this.#settings.fontSize}px;
            white-space: nowrap;
            resize: none;
            padding-left: 1%;
            background-color: rgba(0, 0, 0, 0);
            color: white; border: none;
            border-right: 6px solid transparent;
            overflow: hidden;
            caret-color: transparent;
            outline: none;
            z-index: 1;
            text-align: left;
            line-break: auto;
            word-break: normal;
            user-select: none;
            -ms-user-select: none;
            -webkit-user-select: none;
        `);
        $OBJ(terminal_input).ATTR('role', 'input');
        $OBJ(terminal_input).ATTR('contentEditable', 'true');
        $OBJ(terminal_input).ATTR('tabindex', '0');
        $OBJ(terminal_input).ATTR('autofocus', 'true');
        $OBJ(terminal_input).ATTR('id', this.#hexID.input);

        $ID(this.#hexID.body).append(terminal_text, terminal_input);

        const focus = () => {
            window.setTimeout(() => {
                let sel = window.getSelection();
                sel.selectAllChildren($ID(terminal_input.id));
                sel.collapseToEnd();

                $ID(terminal_input.id).focus();
            }, 0);
        }
        focus();

        const execute = () => {
            $ID(terminal_text.id).innerHTML  += `$${$ID(terminal_input.id).TEXT()}<br>`;
            $ID(terminal_text.id).scrollTo(0, $ID(terminal_text.id).scrollHeight);            
            this.#addCommandHistory($ID(terminal_input.id).TEXT());            
            this.#execute(this.#split($ID(terminal_input.id).TEXT()));
            $ID(terminal_input.id).TEXT('');
        }

        const returnInput = () => {
            this.#privateDate   = $ID(terminal_input.id).TEXT();
            this.#waitInput     = false;
            $ID(terminal_input.id).TEXT('');           
        }

        const returnPrivateInput = () => {
            this.#privateDate       = this.#privateKeyStore;
            this.#privateKeyStore   = '';
            this.#waitPrivateInput  = false;
            $ID(terminal_input.id).TEXT('');
        }

        this.#defaultCommand();
        this.#extraCommand();

        const elements = [];
        elements.push(this.#hexID.title);
        elements.push(this.#hexID.body);

        for(let i = 0; i <= (elements.length - 1); i++){
            $ID(elements[i]).onfocus = () => {
                focus();
            }
            $ID(elements[i]).onmousedown = () => {
                focus();
            }
        }

        $ID(this.#hexID.text).onfocus = (event) => {
            event.stopPropagation();
        }
        $ID(this.#hexID.text).onmousedown = (event) => {
            event.stopPropagation();
        }

        const historyUp = () => {
            if(this.#historyIndex <= 0) { this.#historyIndex = 1; }

            if(this.#commandsHistory.length != 0) {
                this.#historyIndex -= 1;
                $ID(terminal_input.id).HTML(this.#commandsHistory[this.#historyIndex]);
                focus();
            }
        }

        const historyDown = () => {
            if(this.#historyIndex < (this.#commandsHistory.length - 1))
            {
                this.#historyIndex += 1;
                $ID(terminal_input.id).HTML(this.#commandsHistory[this.#historyIndex]);
                focus();
            }
        }

        $ID(this.#hexID.input).onkeyup = (event) => {
            if(this.#waitPrivateInput)
            {
                if(event.key == 'Backspace')
                { this.#privateKeyStore = this.#privateKeyStore.slice(0, -1); }                
                else if(event.keyCode >= 33 && event.keyCode <= 254)
                { 
                    if (event.shiftKey)
                    {
                        this.#privateKeyStore += event.key.toUpperCase();
                    } else
                    {
                        this.#privateKeyStore += event.key.toLowerCase();
                    }
                }      
                event.target.textContent = '*'.repeat(this.#privateKeyStore.length);
            }
        }
        $ID(this.#hexID.input).onkeydown = (event) => {
            if(event.key == 'Enter')
            {
                event.preventDefault();
                if(this.#waitInput)
                {
                    returnInput();
                }
                else if(this.#waitPrivateInput)
                {
                    returnPrivateInput();
                }
                else
                {
                    execute();
                }
            }
            if(this.#waitPrivateInput)
            {               
                event.preventDefault();
            }
            else if(['ArrowRight', 'ArrowLeft'].includes(event.key)) {                
                event.preventDefault();
            }
            else if(['End', 'Home'].includes(event.key)) {
                event.preventDefault();
            }
            else if(event.key == 'ArrowUp') {
                event.preventDefault();
                historyUp();
            }
            else if(event.key == 'ArrowDown') {
                event.preventDefault();
                historyDown();
            }
        }
        $ID(this.#hexID.input).onmousedown = (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.setSelectionRange(
                event.currentTarget.selectionEnd,
                event.currentTarget.selectionEnd,
            );
            event.currentTarget.focus();
        }
    }

    /**
     *  @param {string} Hex 
     *  @return {boolean} Validation
    */
    #validateHex() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }

        return /^[a-fA-F0-9]{6}$/.test(arguments[0]);
    }

    /**
     *  @param {string} IP 
     *  @return {boolean} Validation
    */
    #validateIP() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }

        return /^(([01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}([01]?\d{1,2}|2[0-4]\d|25[0-5])$/.test(arguments[0]);
    }

    /**
     *  @param {string} URL 
     *  @return {boolean} Validation
    */
    #validateURL() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }

        return /^(http|https):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?$/.test(arguments[0]);
    }

    /**
     *  @param {number} Value
     *  @return {string} Double
    */
    #addZero() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'number')) { $ERROR('arg type mismatch'); return; }

        if (arguments[0] < 10) {arguments[0] = '0' + arguments[0]}
        return arguments[0].toString();
    }

    /**
     *  @param {string} Text
     *  @param {string} Color Code
     *  @param {boolean} Type Mode
     */
    log() {
        this.#log(arguments[0], arguments[1], arguments[2]);
    }

    /**
     *  @param {string} Text
     *  @param {string} Color Code
     *  @param {boolean} Type Mode
     */
    #log() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }
        if(!$TYPE(arguments[1], 'undefined')) if(!$TYPE(arguments[1], 'string')) { $ERROR('arg type mismatch'); return; }

        if(this.#returnOutput)
        {
            this.#returnOutput = false;
            this.#outputString = arguments[0];
            return;
        }

        let color       = null,
            dateString  = '',
            logID       = `log${Date.now().toString()}`,
            date        = new Date();

        if(arguments[1] == null) {
            color = '#ffffff';
        } else {
            color = arguments[1];
        }

        if(arguments[0] != null) {
            $ID(this.#hexID.text).innerHTML += `<div style="color:${color};" id="${logID}"></div>`;
            this.#lineID.set(logID);            

            if(this.#settings.dateOption == true)
            {
                dateString = `[${this.#addZero(date.getHours())}:${this.#addZero(date.getMinutes())}:${this.#addZero(date.getSeconds())}:${this.#addZero(date.getMilliseconds()).toString().slice(0, 2)}]`;                

                if(this.#settings.typeMode == true || arguments[2] == true)
                {
                    for (let i = 0; i <= arguments[0].length + 13; i++) {
                        setTimeout(() => { $ID(logID).innerHTML += `${dateString} ${arguments[0].toString()}`.charAt(i); }, (i * 15));
                    }
                }
                else
                {
                    $ID(logID).innerHTML += `${dateString} ${arguments[0].toString()}`;
                }  
            }
            else {                
                if(this.#settings.typeMode == true || arguments[2] == true)
                {
                    for (let i = 0; i <= arguments[0].length; i++) {
                        setTimeout(() => { $ID(logID).innerHTML += arguments[0].charAt(i); }, (i * 15));
                    }
                }
                else
                {
                    $ID(logID).innerHTML += arguments[0].toString();
                }               
            }

            if(arguments[0].length > 0) { $ID(this.#hexID.text).innerHTML += `<div style="font-size:4px;"><br></div>`; }

            $ID(this.#hexID.text).scrollTo(0, $ID(this.#hexID.text).scrollHeight);
        }
    }

    /**
     *  @param {string} Command
     *  @param {object} Function
     *  @param {string} Help
     *  @param {string} Instruction
     */
    addCommand() {
        if(!this.#settings.readOnly) this.#addCommand(arguments[0], arguments[1], arguments[2], arguments[3]);        
    }

    /**
     *  @param {string} Command
     *  @param {object} Function
     *  @param {string} Help
     *  @param {string} Instruction
     */
    #addCommand() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }
        if(!$TYPE(arguments[1], 'undefined')) if(!$TYPE(arguments[1], 'function')) { $ERROR('arg type mismatch'); return; }
        if(!$TYPE(arguments[2], 'undefined')) if(!$TYPE(arguments[2], 'string')) { $ERROR('arg type mismatch'); return; }
        if(!$TYPE(arguments[3], 'undefined')) if(!$TYPE(arguments[3], 'string')) { $ERROR('arg type mismatch'); return; }

        if((arguments[0] != null && arguments[0] != '') && (arguments[1] != null)) {
            this.#commands.set(arguments[0].toString().toLowerCase(), arguments[1]);
            this.#commandsHelp.set(arguments[0].toString().toLowerCase(), arguments[2]);
            this.#commandsInstruct.set(arguments[0].toString().toLowerCase(), arguments[3]);
        }
    }

    /**
     *  @param {string} Command
     */
    removeCommand() {
        this.#removeCommand(arguments[0]);
    }

    /**
     *  @param {string} Command
     */
    #removeCommand() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }

        if((arguments[0] != null && arguments[0] != '')) {
            this.#commands.delete(arguments[0].toString().toLowerCase());
            this.#commandsHelp.delete(arguments[0].toString().toLowerCase());
            this.#commandsInstruct.delete(arguments[0].toString().toLowerCase());
        }
    }

    clearCommand() {
        this.#clearCommand();
    }

    #clearCommand() {
        this.#commands.clear();
        this.#commandsHelp.clear();
        this.#commandsInstruct.clear();
        this.#defaultCommand();
    }

    /**
     *  @param {string} Command
     */
    #addCommandHistory() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }

        if(arguments[0] != null && arguments[0] != '') {
            if(this.#commandsHistory.length == 0){
                this.#commandsHistory.push(arguments[0].toString().toLowerCase());
            }
            else {
                if(this.#commandsHistory[this.#commandsHistory.length - 1] != arguments[0].toString().toLowerCase()){
                    this.#commandsHistory.push(arguments[0].toString().toLowerCase());
                }
            }
            this.#historyIndex = (this.#commandsHistory.length);
        }
    }

    sortCommand() {
        this.#sortCommand();
    }

    #sortCommand() {
        if(this.#commands.length != 0 && this.#commandsHelp.length != 0){
            this.#commandsHelp = new Map(Array.from(this.#commandsHelp).sort((a, b) => a[0].localeCompare(b[0])));
        }
    }

    #defaultCommand() { 
        this.#addCommand('clear', function () {
            this.#lineID.clear();
            $ID(this.#hexID.text).HTML('');            
        }, 'clear terminal screen'
         , '');

        this.#addCommand('echo', function () {
            if(arguments[0].length <= 1) { this.log(`${arguments[0][0]} require args`, '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.log('arg type mismatch'); } else {
                this.log(`${arguments[0][1]}`);                
            }     
        }, 'echo words'
         , '');

         this.#addCommand('uptime', function () {
            const calcUpTime = new Date() - this.#upTime;
            this.#log(`${calcUpTime}`);
            
        }, 'show up time in milisecond'
         , '');

        this.#addCommand('exit', function () {
            $TIMEOUT(() => { this.#exit(); }, 100);
        }, 'terminate terminal'
         , '');

        this.#addCommand('history', function () {
            let _data = '';
            for(let i = 0; i <= (this.#commandsHistory.length - 2); i++){
                _data += `${this.#commandsHistory[i]}<br>`;
            }
            if($TYPE(_data, 'empty'))
            { this.#log('no command in history'); }
            else
            { this.#log(_data); }
            
        }, 'list history commands'
         , '');

         this.#addCommand('sch', function () {
            if(arguments.length <= 0) { $ERROR('require args'); return; }

            if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'object')) { $ERROR('arg type mismatch'); return; }

            if(!$TYPE(arguments[0][0], 'undefined')) if(!$TYPE(arguments[0][0], 'string')) { $ERROR('arg type mismatch'); return; }
            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { $ERROR('arg type mismatch'); return; }
            if(!$TYPE(arguments[0][2], 'undefined')) if(!$TYPE(arguments[0][2], 'string')) { $ERROR('arg type mismatch'); return; }

            if(!$TYPE(arguments[0][2], 'undefined')) {
                if (this.#commands.has(arguments[0][2].toLowerCase()) && arguments[0][2].toLowerCase() != 'sch') {
                    const run = () => this.#commands.get(arguments[0][2].toLowerCase());
                    $TIMEOUT(() => { run().call(this, arguments[0].splice(2, arguments[0].length)); }, ($CAST(arguments[0][1], 'number') * 1000) || 1000);                
                }
                
            }
            else { $ERROR('null arg'); }
                        
        }, 'Scheduale a Command'
         , 'sch &lt;time&gt; &lt;command&gt;');

        this.#addCommand('help', function () {
            let _data = '';
            for(let [key, value] of this.#commandsHelp){
                _data += `${key}:&nbsp;${value}<br>`;
            }
            if($TYPE(_data, 'empty'))
            { this.#log('no command is registered'); }
            else
            { this.#log(_data); }
        }, 'commands & helps'
         , '');
    }

    #extraCommand() {       
        this.#addCommand('date', function () {
            let date = new Date();
            this.#log(`${date.getFullYear()}/${this.#addZero(date.getMonth())}/${this.#addZero(date.getDay())}`);
        }, 'show date'
         , '');

        this.#addCommand('time', function () {
            let date = new Date();
            this.#log(`${this.#addZero(date.getHours())}:${this.#addZero(date.getMinutes())}:${this.#addZero(date.getSeconds())}`);
        }, 'show time'
         , '');

        this.#addCommand('color', function () {
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }
            if(!$TYPE(arguments[0][2], 'undefined')) if(!$TYPE(arguments[0][2], 'string')) { this.#log('arg type mismatch', '#CC0000'); }

            if(this.#validateHex(arguments[0][1]))
            {
                $ID(this.#hexID.body).STYLE.backgroundColor = `rgba(${this.#hexRGB('#' + arguments[0][1])}, ${this.#settings.opacity})`;
            }
            if(this.#validateHex(arguments[0][2]))
            {
                $ID(this.#hexID.body).STYLE.color = `#${arguments[0][2]}`;
                $ID(this.#hexID.text).STYLE.color = `#${arguments[0][2]}`;
                $ID(this.#hexID.input).STYLE.color = `#${arguments[0][2]}`;
            }
        }, 'change terminal color'
         , 'color &lt;hex color&gt; &lt;hex color&gt;');

        this.#addCommand('ping', function () {           
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }            

            if(this.#validateURL(arguments[0][1]) || this.#validateIP(arguments[0][1]) || arguments[0][1] == 'localhost')
            {
                this.#lock(true);

                var startTime, endTime, elapsedTime;
                const options = {
                    method: 'GET',
                    url: `https://api.allorigins.win/get?url=${arguments[0][1]}`,
                    cache: false,
                    timeout: 5000,
                    headers: {accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest'},

                    beforeSend: function() {
                        startTime = new Date();
                    },
                    success: (response, status) => {                        
                        endTime = new Date();
                        elapsedTime = endTime - startTime;
                        this.#log(`reachable ${elapsedTime}ms`);
                        this.#lock(false);
                    },
                    error: (errorMsg, status) => {
                        endTime = new Date();
                        elapsedTime = endTime - startTime;
                        this.#log(`not reachable ${elapsedTime}ms`, '#CC0000');      
                        this.#lock(false);                      
                    }
                };
                
                $AJAX(options);                
            }
        }, 'ping url or ip'
         , 'ping &lt;url|ip|localhost&gt;');

        this.#addCommand('md2', function () {
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }            

            if(!$TYPE(arguments[0][1], 'empty'))
            {                
                const MD2Hash = (r) => { var o,f,a,e,t,h,c='0123456789abcdef'.split(''),d=[41,46,67,201,162,216,124,1,61,54,84,161,236,240,6,19,98,167,5,243,192,199,115,140,152,147,43,217,188,76,130,202,30,155,87,60,253,212,224,22,103,66,111,24,138,23,229,18,190,78,196,214,218,158,222,73,160,251,245,142,187,47,238,122,169,104,121,145,21,178,7,63,148,194,16,137,11,34,95,33,128,127,93,154,90,144,50,39,53,62,204,231,191,247,151,3,255,25,48,179,72,165,181,209,215,94,146,42,172,86,170,198,79,184,56,210,150,164,125,182,118,252,107,226,156,116,4,241,69,157,112,89,100,113,135,32,134,91,207,101,230,45,168,2,27,96,37,173,174,176,185,246,28,70,97,105,52,64,126,15,85,71,163,35,221,81,175,58,195,92,249,206,186,197,234,38,44,83,13,110,133,40,132,9,211,223,205,244,65,129,77,82,106,220,55,200,108,193,171,250,36,225,123,8,12,189,177,74,120,136,149,139,227,99,232,109,233,203,213,254,59,0,29,57,242,239,183,14,102,88,208,228,166,119,114,248,235,117,75,10,49,68,80,180,143,237,31,26,219,153,141,51,159,17,131,20],i=[],l=[],n=[],s=0,v=1,A=0,C=0,b=0,g=r.length;for(f=0;f<16;++f)l[f]=n[f]=0;i[16]=i[17]=i[18]=0;do{for(i[0]=i[16],i[1]=i[17],i[2]=i[18],i[16]=i[17]=i[18]=i[3]=i[4]=i[5]=i[6]=i[7]=i[8]=i[9]=i[10]=i[11]=i[12]=i[13]=i[14]=i[15]=0,f=C;A<g&&f<16;++A)(o=r.charCodeAt(A))<128?i[f++]=o:o<2048?(i[f++]=192|o>>6,i[f++]=128|63&o):o<55296||o>=57344?(i[f++]=224|o>>12,i[f++]=128|o>>6&63,i[f++]=128|63&o):(o=65536+((1023&o)<<10|1023&r.charCodeAt(++A)),i[f++]=240|o>>18,i[f++]=128|o>>12&63,i[f++]=128|o>>6&63,i[f++]=128|63&o);if(b+=f-C,C=f-16,A===g&&f<16)for(v=2,t=16-(15&b);f<16;++f)i[f]=t;for(f=0;f<16;++f)n[f]^=d[i[f]^s],s=n[f];for(f=0;f<v;++f)for(h=0===f?i:n,l[16]=h[0],l[32]=l[16]^l[0],l[17]=h[1],l[33]=l[17]^l[1],l[18]=h[2],l[34]=l[18]^l[2],l[19]=h[3],l[35]=l[19]^l[3],l[20]=h[4],l[36]=l[20]^l[4],l[21]=h[5],l[37]=l[21]^l[5],l[22]=h[6],l[38]=l[22]^l[6],l[23]=h[7],l[39]=l[23]^l[7],l[24]=h[8],l[40]=l[24]^l[8],l[25]=h[9],l[41]=l[25]^l[9],l[26]=h[10],l[42]=l[26]^l[10],l[27]=h[11],l[43]=l[27]^l[11],l[28]=h[12],l[44]=l[28]^l[12],l[29]=h[13],l[45]=l[29]^l[13],l[30]=h[14],l[46]=l[30]^l[14],l[31]=h[15],l[47]=l[31]^l[15],t=0,a=0;a<18;++a){for(e=0;e<48;++e)l[e]=t=l[e]^d[t];t=t+a&255}}while(1===v);var p='';for(f=0;f<16;++f)p+=c[l[f]>>4&15]+c[15&l[f]]; return p };
                const Hash = MD2Hash(arguments[0][1]);
                this.#log(Hash);   
            }
        }, 'generate md2'
         , 'md2 &lt;string&gt;');

        this.#addCommand('md4', function () {
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }            

            if(!$TYPE(arguments[0][1], 'empty'))
            {
                const MD4Hash = (r) => { var n=8;function t(r,n){r[n>>5]|=128<<n%32,r[14+(n+64>>>9<<4)]=n;for(var t=1732584193,u=-271733879,f=-1732584194,h=271733878,i=0;i<r.length;i+=16){var v=t,A=u,g=f,l=h;t=e(t,u,f,h,r[i+0],3),h=e(h,t,u,f,r[i+1],7),f=e(f,h,t,u,r[i+2],11),u=e(u,f,h,t,r[i+3],19),t=e(t,u,f,h,r[i+4],3),h=e(h,t,u,f,r[i+5],7),f=e(f,h,t,u,r[i+6],11),u=e(u,f,h,t,r[i+7],19),t=e(t,u,f,h,r[i+8],3),h=e(h,t,u,f,r[i+9],7),f=e(f,h,t,u,r[i+10],11),u=e(u,f,h,t,r[i+11],19),t=e(t,u,f,h,r[i+12],3),h=e(h,t,u,f,r[i+13],7),f=e(f,h,t,u,r[i+14],11),t=a(t,u=e(u,f,h,t,r[i+15],19),f,h,r[i+0],3),h=a(h,t,u,f,r[i+4],5),f=a(f,h,t,u,r[i+8],9),u=a(u,f,h,t,r[i+12],13),t=a(t,u,f,h,r[i+1],3),h=a(h,t,u,f,r[i+5],5),f=a(f,h,t,u,r[i+9],9),u=a(u,f,h,t,r[i+13],13),t=a(t,u,f,h,r[i+2],3),h=a(h,t,u,f,r[i+6],5),f=a(f,h,t,u,r[i+10],9),u=a(u,f,h,t,r[i+14],13),t=a(t,u,f,h,r[i+3],3),h=a(h,t,u,f,r[i+7],5),f=a(f,h,t,u,r[i+11],9),t=c(t,u=a(u,f,h,t,r[i+15],13),f,h,r[i+0],3),h=c(h,t,u,f,r[i+8],9),f=c(f,h,t,u,r[i+4],11),u=c(u,f,h,t,r[i+12],15),t=c(t,u,f,h,r[i+2],3),h=c(h,t,u,f,r[i+10],9),f=c(f,h,t,u,r[i+6],11),u=c(u,f,h,t,r[i+14],15),t=c(t,u,f,h,r[i+1],3),h=c(h,t,u,f,r[i+9],9),f=c(f,h,t,u,r[i+5],11),u=c(u,f,h,t,r[i+13],15),t=c(t,u,f,h,r[i+3],3),h=c(h,t,u,f,r[i+11],9),f=c(f,h,t,u,r[i+7],11),u=c(u,f,h,t,r[i+15],15),t=o(t,v),u=o(u,A),f=o(f,g),h=o(h,l)}return Array(t,u,f,h)}function u(r,n,t,u,e,a){return o((c=o(o(n,r),o(u,a)))<<(f=e)|c>>>32-f,t);var c,f}function e(r,n,t,e,a,c){return u(n&t|~n&e,r,0,a,c,0)}function a(r,n,t,e,a,c){return u(n&t|n&e|t&e,r,0,a,c,1518500249)}function c(r,n,t,e,a,c){return u(n^t^e,r,0,a,c,1859775393)}function o(r,n){var t=(65535&r)+(65535&n);return(r>>16)+(n>>16)+(t>>16)<<16|65535&t}function f(r){for(var t=Array(),u=(1<<n)-1,e=0;e<r.length*n;e+=n)t[e>>5]|=(r.charCodeAt(e/n)&u)<<e%32;return t}return function(r){for(var n='0123456789abcdef',t='',u=0;u<4*r.length;u++)t+=n.charAt(r[u>>2]>>u%4*8+4&15)+n.charAt(r[u>>2]>>u%4*8&15);return t}(t(f(r),r.length*n)) };
                const Hash = MD4Hash(arguments[0][1]);
                this.#log(Hash);
            }
        }, 'generate md4'
         , 'md4 &lt;string&gt;');

        this.#addCommand('md5', function () {
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }            

            if(!$TYPE(arguments[0][1], 'empty'))
            {
                const MD5Hash = (r) => { function n(r,n){return r<<n|r>>>32-n}function t(r,n){var t,o,e,u,f;return e=2147483648&r,u=2147483648&n,f=(1073741823&r)+(1073741823&n),(t=1073741824&r)&(o=1073741824&n)?2147483648^f^e^u:t|o?1073741824&f?3221225472^f^e^u:1073741824^f^e^u:f^e^u}function o(r,o,e,u,f,i,a){return r=t(r,t(t(function(r,n,t){return r&n|~r&t}(o,e,u),f),a)),t(n(r,i),o)}function e(r,o,e,u,f,i,a){return r=t(r,t(t(function(r,n,t){return r&t|n&~t}(o,e,u),f),a)),t(n(r,i),o)}function u(r,o,e,u,f,i,a){return r=t(r,t(t(function(r,n,t){return r^n^t}(o,e,u),f),a)),t(n(r,i),o)}function f(r,o,e,u,f,i,a){return r=t(r,t(t(function(r,n,t){return n^(r|~t)}(o,e,u),f),a)),t(n(r,i),o)}function i(r){var n,t='',o='';for(n=0;n<=3;n++)t+=(o='0'+(r>>>8*n&255).toString(16)).substr(o.length-2,2);return t}var a,c,C,h,g,d,S,m,v,l=Array();for(r=function(r){r=r.replace(/\r\n/g,'\n');for(var n='',t=0;t<r.length;t++){var o=r.charCodeAt(t);o<128?n+=String.fromCharCode(o):o>127&&o<2048?(n+=String.fromCharCode(o>>6|192),n+=String.fromCharCode(63&o|128)):(n+=String.fromCharCode(o>>12|224),n+=String.fromCharCode(o>>6&63|128),n+=String.fromCharCode(63&o|128))}return n}(r),l=function(r){for(var n,t=r.length,o=t+8,e=16*((o-o%64)/64+1),u=Array(e-1),f=0,i=0;i<t;)f=i%4*8,u[n=(i-i%4)/4]=u[n]|r.charCodeAt(i)<<f,i++;return f=i%4*8,u[n=(i-i%4)/4]=u[n]|128<<f,u[e-2]=t<<3,u[e-1]=t>>>29,u}(r),d=1732584193,S=4023233417,m=2562383102,v=271733878,a=0;a<l.length;a+=16)c=d,C=S,h=m,g=v,d=o(d,S,m,v,l[a+0],7,3614090360),v=o(v,d,S,m,l[a+1],12,3905402710),m=o(m,v,d,S,l[a+2],17,606105819),S=o(S,m,v,d,l[a+3],22,3250441966),d=o(d,S,m,v,l[a+4],7,4118548399),v=o(v,d,S,m,l[a+5],12,1200080426),m=o(m,v,d,S,l[a+6],17,2821735955),S=o(S,m,v,d,l[a+7],22,4249261313),d=o(d,S,m,v,l[a+8],7,1770035416),v=o(v,d,S,m,l[a+9],12,2336552879),m=o(m,v,d,S,l[a+10],17,4294925233),S=o(S,m,v,d,l[a+11],22,2304563134),d=o(d,S,m,v,l[a+12],7,1804603682),v=o(v,d,S,m,l[a+13],12,4254626195),m=o(m,v,d,S,l[a+14],17,2792965006),d=e(d,S=o(S,m,v,d,l[a+15],22,1236535329),m,v,l[a+1],5,4129170786),v=e(v,d,S,m,l[a+6],9,3225465664),m=e(m,v,d,S,l[a+11],14,643717713),S=e(S,m,v,d,l[a+0],20,3921069994),d=e(d,S,m,v,l[a+5],5,3593408605),v=e(v,d,S,m,l[a+10],9,38016083),m=e(m,v,d,S,l[a+15],14,3634488961),S=e(S,m,v,d,l[a+4],20,3889429448),d=e(d,S,m,v,l[a+9],5,568446438),v=e(v,d,S,m,l[a+14],9,3275163606),m=e(m,v,d,S,l[a+3],14,4107603335),S=e(S,m,v,d,l[a+8],20,1163531501),d=e(d,S,m,v,l[a+13],5,2850285829),v=e(v,d,S,m,l[a+2],9,4243563512),m=e(m,v,d,S,l[a+7],14,1735328473),d=u(d,S=e(S,m,v,d,l[a+12],20,2368359562),m,v,l[a+5],4,4294588738),v=u(v,d,S,m,l[a+8],11,2272392833),m=u(m,v,d,S,l[a+11],16,1839030562),S=u(S,m,v,d,l[a+14],23,4259657740),d=u(d,S,m,v,l[a+1],4,2763975236),v=u(v,d,S,m,l[a+4],11,1272893353),m=u(m,v,d,S,l[a+7],16,4139469664),S=u(S,m,v,d,l[a+10],23,3200236656),d=u(d,S,m,v,l[a+13],4,681279174),v=u(v,d,S,m,l[a+0],11,3936430074),m=u(m,v,d,S,l[a+3],16,3572445317),S=u(S,m,v,d,l[a+6],23,76029189),d=u(d,S,m,v,l[a+9],4,3654602809),v=u(v,d,S,m,l[a+12],11,3873151461),m=u(m,v,d,S,l[a+15],16,530742520),d=f(d,S=u(S,m,v,d,l[a+2],23,3299628645),m,v,l[a+0],6,4096336452),v=f(v,d,S,m,l[a+7],10,1126891415),m=f(m,v,d,S,l[a+14],15,2878612391),S=f(S,m,v,d,l[a+5],21,4237533241),d=f(d,S,m,v,l[a+12],6,1700485571),v=f(v,d,S,m,l[a+3],10,2399980690),m=f(m,v,d,S,l[a+10],15,4293915773),S=f(S,m,v,d,l[a+1],21,2240044497),d=f(d,S,m,v,l[a+8],6,1873313359),v=f(v,d,S,m,l[a+15],10,4264355552),m=f(m,v,d,S,l[a+6],15,2734768916),S=f(S,m,v,d,l[a+13],21,1309151649),d=f(d,S,m,v,l[a+4],6,4149444226),v=f(v,d,S,m,l[a+11],10,3174756917),m=f(m,v,d,S,l[a+2],15,718787259),S=f(S,m,v,d,l[a+9],21,3951481745),d=t(d,c),S=t(S,C),m=t(m,h),v=t(v,g);return(i(d)+i(S)+i(m)+i(v)).toLowerCase() };
                const Hash = MD5Hash(arguments[0][1]);
                this.#log(Hash); 
            }
        }, 'generate md5'
         , 'md5 &lt;string&gt;');

        this.#addCommand('sha1', function () {
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }            

            if(!$TYPE(arguments[0][1], 'empty'))
            {
                const SHA1Hash = (r) => { function o(r,o){return r<<o|r>>>32-o}function e(r){var o,e='';for(o=7;o>=0;o--)e+=(r>>>4*o&15).toString(16);return e}var a,t,h,n,C,c,f,d,A,s=new Array(80),g=1732584193,u=4023233417,i=2562383102,S=271733878,m=3285377520,p=(r=function(r){r=r.replace(/\r\n/g,'\n');for(var o='',e=0;e<r.length;e++){var a=r.charCodeAt(e);a<128?o+=String.fromCharCode(a):a>127&&a<2048?(o+=String.fromCharCode(a>>6|192),o+=String.fromCharCode(63&a|128)):(o+=String.fromCharCode(a>>12|224),o+=String.fromCharCode(a>>6&63|128),o+=String.fromCharCode(63&a|128))}return o}(r)).length,l=new Array;for(t=0;t<p-3;t+=4)h=r.charCodeAt(t)<<24|r.charCodeAt(t+1)<<16|r.charCodeAt(t+2)<<8|r.charCodeAt(t+3),l.push(h);switch(p%4){case 0:t=2147483648;break;case 1:t=r.charCodeAt(p-1)<<24|8388608;break;case 2:t=r.charCodeAt(p-2)<<24|r.charCodeAt(p-1)<<16|32768;break;case 3:t=r.charCodeAt(p-3)<<24|r.charCodeAt(p-2)<<16|r.charCodeAt(p-1)<<8|128}for(l.push(t);l.length%16!=14;)l.push(0);for(l.push(p>>>29),l.push(p<<3&4294967295),a=0;a<l.length;a+=16){for(t=0;t<16;t++)s[t]=l[a+t];for(t=16;t<=79;t++)s[t]=o(s[t-3]^s[t-8]^s[t-14]^s[t-16],1);for(n=g,C=u,c=i,f=S,d=m,t=0;t<=19;t++)A=o(n,5)+(C&c|~C&f)+d+s[t]+1518500249&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;for(t=20;t<=39;t++)A=o(n,5)+(C^c^f)+d+s[t]+1859775393&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;for(t=40;t<=59;t++)A=o(n,5)+(C&c|C&f|c&f)+d+s[t]+2400959708&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;for(t=60;t<=79;t++)A=o(n,5)+(C^c^f)+d+s[t]+3395469782&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;g=g+n&4294967295,u=u+C&4294967295,i=i+c&4294967295,S=S+f&4294967295,m=m+d&4294967295}return(A=e(g)+e(u)+e(i)+e(S)+e(m)).toLowerCase() };
                const Hash = SHA1Hash(arguments[0][1]);
                this.#log(Hash); 
            }
        }, 'generate sha1'
         , 'sha1 &lt;string&gt;');

        this.#addCommand('sha256', function () {
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }            

            if(!$TYPE(arguments[0][1], 'empty'))
            {
                const SHA256Hash = (r) => { function n(r,n){var t=(65535&r)+(65535&n);return(r>>16)+(n>>16)+(t>>16)<<16|65535&t}function t(r,n){return r>>>n|r<<32-n}function e(r,n){return r>>>n}function o(r,n,t){return r&n^~r&t}function a(r,n,t){return r&n^r&t^n&t}function u(r){return t(r,2)^t(r,13)^t(r,22)}function f(r){return t(r,6)^t(r,11)^t(r,25)}function c(r){return t(r,7)^t(r,18)^e(r,3)}return function(r){for(var n='0123456789abcdef',t='',e=0;e<4*r.length;e++)t+=n.charAt(r[e>>2]>>8*(3-e%4)+4&15)+n.charAt(r[e>>2]>>8*(3-e%4)&15);return t}(function(r,i){var h,C,g,d,A,v,S,l,m,y,w,s=new Array(1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298),H=new Array(1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225),b=new Array(64);r[i>>5]|=128<<24-i%32,r[15+(i+64>>9<<4)]=i;for(var p=0;p<r.length;p+=16){h=H[0],C=H[1],g=H[2],d=H[3],A=H[4],v=H[5],S=H[6],l=H[7];for(var j=0;j<64;j++)b[j]=j<16?r[j+p]:n(n(n(t(w=b[j-2],17)^t(w,19)^e(w,10),b[j-7]),c(b[j-15])),b[j-16]),m=n(n(n(n(l,f(A)),o(A,v,S)),s[j]),b[j]),y=n(u(h),a(h,C,g)),l=S,S=v,v=A,A=n(d,m),d=g,g=C,C=h,h=n(m,y);H[0]=n(h,H[0]),H[1]=n(C,H[1]),H[2]=n(g,H[2]),H[3]=n(d,H[3]),H[4]=n(A,H[4]),H[5]=n(v,H[5]),H[6]=n(S,H[6]),H[7]=n(l,H[7])}return H}(function(r){for(var n=Array(),t=0;t<8*r.length;t+=8)n[t>>5]|=(255&r.charCodeAt(t/8))<<24-t%32;return n}(r=function(r){r=r.replace(/\r\n/g,'\n');for(var n='',t=0;t<r.length;t++){var e=r.charCodeAt(t);e<128?n+=String.fromCharCode(e):e>127&&e<2048?(n+=String.fromCharCode(e>>6|192),n+=String.fromCharCode(63&e|128)):(n+=String.fromCharCode(e>>12|224),n+=String.fromCharCode(e>>6&63|128),n+=String.fromCharCode(63&e|128))}return n}(r)),8*r.length)) };
                const Hash = SHA256Hash(arguments[0][1]);
                this.#log(Hash); 
            }
        }, 'generate sha256'
         , 'sha256 &lt;string&gt;');

        this.#addCommand('sha512', function () {
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }            

            if(!$TYPE(arguments[0][1], 'empty'))
            {                
                const SHA512Hash = (r) => { function e(r,e){this.highOrder=r,this.lowOrder=e}var w,n,h,d,O,o,i,g,l,t,u=[new e(1779033703,4089235720),new e(3144134277,2227873595),new e(1013904242,4271175723),new e(2773480762,1595750129),new e(1359893119,2917565137),new e(2600822924,725511199),new e(528734635,4215389547),new e(1541459225,327033209)],a=[new e(1116352408,3609767458),new e(1899447441,602891725),new e(3049323471,3964484399),new e(3921009573,2173295548),new e(961987163,4081628472),new e(1508970993,3053834265),new e(2453635748,2937671579),new e(2870763221,3664609560),new e(3624381080,2734883394),new e(310598401,1164996542),new e(607225278,1323610764),new e(1426881987,3590304994),new e(1925078388,4068182383),new e(2162078206,991336113),new e(2614888103,633803317),new e(3248222580,3479774868),new e(3835390401,2666613458),new e(4022224774,944711139),new e(264347078,2341262773),new e(604807628,2007800933),new e(770255983,1495990901),new e(1249150122,1856431235),new e(1555081692,3175218132),new e(1996064986,2198950837),new e(2554220882,3999719339),new e(2821834349,766784016),new e(2952996808,2566594879),new e(3210313671,3203337956),new e(3336571891,1034457026),new e(3584528711,2466948901),new e(113926993,3758326383),new e(338241895,168717936),new e(666307205,1188179964),new e(773529912,1546045734),new e(1294757372,1522805485),new e(1396182291,2643833823),new e(1695183700,2343527390),new e(1986661051,1014477480),new e(2177026350,1206759142),new e(2456956037,344077627),new e(2730485921,1290863460),new e(2820302411,3158454273),new e(3259730800,3505952657),new e(3345764771,106217008),new e(3516065817,3606008344),new e(3600352804,1432725776),new e(4094571909,1467031594),new e(275423344,851169720),new e(430227734,3100823752),new e(506948616,1363258195),new e(659060556,3750685593),new e(883997877,3785050280),new e(958139571,3318307427),new e(1322822218,3812723403),new e(1537002063,2003034995),new e(1747873779,3602036899),new e(1955562222,1575990012),new e(2024104815,1125592928),new e(2227730452,2716904306),new e(2361852424,442776044),new e(2428436474,593698344),new e(2756734187,3733110249),new e(3204031479,2999351573),new e(3329325298,3815920427),new e(3391569614,3928383900),new e(3515267271,566280711),new e(3940187606,3454069534),new e(4118630271,4000239992),new e(116418474,1914138554),new e(174292421,2731055270),new e(289380356,3203993006),new e(460393269,320620315),new e(685471733,587496836),new e(852142971,1086792851),new e(1017036298,365543100),new e(1126000580,2618297676),new e(1288033470,3409855158),new e(1501505948,4234509866),new e(1607167915,987167468),new e(1816402316,1246189591)],c=new Array(64);function f(r,w){var n,h,d;return n=(65535&r.lowOrder)+(65535&w.lowOrder),d=(65535&(h=(r.lowOrder>>>16)+(w.lowOrder>>>16)+(n>>>16)))<<16|65535&n,n=(65535&r.highOrder)+(65535&w.highOrder)+(h>>>16),new e((65535&(h=(r.highOrder>>>16)+(w.highOrder>>>16)+(n>>>16)))<<16|65535&n,d)}function v(r,w,n,h){var d,O,o;return d=(65535&r.lowOrder)+(65535&w.lowOrder)+(65535&n.lowOrder)+(65535&h.lowOrder),o=(65535&(O=(r.lowOrder>>>16)+(w.lowOrder>>>16)+(n.lowOrder>>>16)+(h.lowOrder>>>16)+(d>>>16)))<<16|65535&d,d=(65535&r.highOrder)+(65535&w.highOrder)+(65535&n.highOrder)+(65535&h.highOrder)+(O>>>16),new e((65535&(O=(r.highOrder>>>16)+(w.highOrder>>>16)+(n.highOrder>>>16)+(h.highOrder>>>16)+(d>>>16)))<<16|65535&d,o)}function s(r,w,n,h,d){var O,o,i;return O=(65535&r.lowOrder)+(65535&w.lowOrder)+(65535&n.lowOrder)+(65535&h.lowOrder)+(65535&d.lowOrder),i=(65535&(o=(r.lowOrder>>>16)+(w.lowOrder>>>16)+(n.lowOrder>>>16)+(h.lowOrder>>>16)+(d.lowOrder>>>16)+(O>>>16)))<<16|65535&O,O=(65535&r.highOrder)+(65535&w.highOrder)+(65535&n.highOrder)+(65535&h.highOrder)+(65535&d.highOrder)+(o>>>16),new e((65535&(o=(r.highOrder>>>16)+(w.highOrder>>>16)+(n.highOrder>>>16)+(h.highOrder>>>16)+(d.highOrder>>>16)+(O>>>16)))<<16|65535&O,i)}function A(r,w,n){return new e(r.highOrder&w.highOrder^r.highOrder&n.highOrder^w.highOrder&n.highOrder,r.lowOrder&w.lowOrder^r.lowOrder&n.lowOrder^w.lowOrder&n.lowOrder)}function p(r,w,n){return new e(r.highOrder&w.highOrder^~r.highOrder&n.highOrder,r.lowOrder&w.lowOrder^~r.lowOrder&n.lowOrder)}function C(r,w){return w<=32?new e(r.highOrder>>>w|r.lowOrder<<32-w,r.lowOrder>>>w|r.highOrder<<32-w):new e(r.lowOrder>>>w|r.highOrder<<32-w,r.highOrder>>>w|r.lowOrder<<32-w)}function H(r){var w=C(r,28),n=C(r,34),h=C(r,39);return new e(w.highOrder^n.highOrder^h.highOrder,w.lowOrder^n.lowOrder^h.lowOrder)}function b(r){var w=C(r,14),n=C(r,18),h=C(r,41);return new e(w.highOrder^n.highOrder^h.highOrder,w.lowOrder^n.lowOrder^h.lowOrder)}function m(r){var w=C(r,1),n=C(r,8),h=y(r,7);return new e(w.highOrder^n.highOrder^h.highOrder,w.lowOrder^n.lowOrder^h.lowOrder)}function y(r,w){return w<=32?new e(r.highOrder>>>w,r.lowOrder>>>w|r.highOrder<<32-w):new e(0,r.highOrder<<32-w)}var I,R,S,U,j=8*(r=unescape(encodeURIComponent(r))).length;r=function(r){for(var e=[],w=8*r.length,n=0;n<w;n+=8)e[n>>5]|=(255&r.charCodeAt(n/8))<<24-n%32;return e}(r),r[j>>5]|=128<<24-j%32,r[31+(j+128>>10<<5)]=j;for(var k=0;k<r.length;k+=32){w=u[0],n=u[1],h=u[2],d=u[3],O=u[4],o=u[5],i=u[6],g=u[7];for(var q=0;q<80;q++)c[q]=q<16?new e(r[2*q+k],r[2*q+k+1]):v((I=c[q-2],R=void 0,S=void 0,U=void 0,R=C(I,19),S=C(I,61),U=y(I,6),new e(R.highOrder^S.highOrder^U.highOrder,R.lowOrder^S.lowOrder^U.lowOrder)),c[q-7],m(c[q-15]),c[q-16]),l=s(g,b(O),p(O,o,i),a[q],c[q]),t=f(H(w),A(w,n,h)),g=i,i=o,o=O,O=f(d,l),d=h,h=n,n=w,w=f(l,t);u[0]=f(w,u[0]),u[1]=f(n,u[1]),u[2]=f(h,u[2]),u[3]=f(d,u[3]),u[4]=f(O,u[4]),u[5]=f(o,u[5]),u[6]=f(i,u[6]),u[7]=f(g,u[7])}var x=[];for(k=0;k<u.length;k++)x.push(u[k].highOrder),x.push(u[k].lowOrder);return function(r){for(var e,w='0123456789abcdef',n='',h=4*r.length,d=0;d<h;d+=1)e=r[d>>2]>>8*(3-d%4),n+=w.charAt(e>>4&15)+w.charAt(15&e);return n}(x) };
                const Hash = SHA512Hash(arguments[0][1]);
                this.#log(Hash); 
            }
        }, 'generate sha512'
         , 'sha512 &lt;string&gt;');

        this.#addCommand('encode', function () {
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }            

            if(!$TYPE(arguments[0][1], 'empty'))
            {                
                const EncodeBase64 = (r) => { var a,o,t,e,h,C,n,c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',d='',g=0;r=r.replace(/\r\n/g,'\n');for(var f='',i=0;i<r.length;i++){var A=r.charCodeAt(i);A<128?f+=String.fromCharCode(A):A>127&&A<2048?(f+=String.fromCharCode(A>>6|192),f+=String.fromCharCode(63&A|128)):(f+=String.fromCharCode(A>>12|224),f+=String.fromCharCode(A>>6&63|128),f+=String.fromCharCode(63&A|128))}for(r=f;g<r.length;)e=(a=r.charCodeAt(g++))>>2,h=(3&a)<<4|(o=r.charCodeAt(g++))>>4,C=(15&o)<<2|(t=r.charCodeAt(g++))>>6,n=63&t,isNaN(o)?C=n=64:isNaN(t)&&(n=64),d=d+c.charAt(e)+c.charAt(h)+c.charAt(C)+c.charAt(n);return d };
                const Hash = EncodeBase64(arguments[0][1]);
                this.#log(Hash); 
            }
        }, 'encode base64'
         , 'encode &lt;string&gt;');

        this.#addCommand('decode', function () {
            if(arguments[0].length <= 1) { this.#log('require args', '#CC0000'); }

            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { this.#log('arg type mismatch', '#CC0000'); }            

            if(!$TYPE(arguments[0][1], 'empty'))
            {                
                const DecodeBase64 = (r) => { var e,o,a,t,h,C,d='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',n='',c=0;for(r=r.replace(/[^A-Za-z0-9\+\/\=]/g,'');c<r.length;)e=d.indexOf(r.charAt(c++))<<2|(t=d.indexOf(r.charAt(c++)))>>4,o=(15&t)<<4|(h=d.indexOf(r.charAt(c++)))>>2,a=(3&h)<<6|(C=d.indexOf(r.charAt(c++))),n+=String.fromCharCode(e),64!=h&&(n+=String.fromCharCode(o)),64!=C&&(n+=String.fromCharCode(a));c=0;for(var f=0,i=0;c<n.length;)(f=n.charCodeAt(c))<128?(String.fromCharCode(f),c++):f>191&&f<224?(i=n.charCodeAt(c+1),String.fromCharCode((31&f)<<6|63&i),c+=2):(i=n.charCodeAt(c+1),c3=n.charCodeAt(c+2),String.fromCharCode((15&f)<<12|(63&i)<<6|63&c3),c+=3);return n };
                const Hash = DecodeBase64(arguments[0][1]);
                this.#log(Hash); 
            }
        }, 'decode base64'
         , 'decode &lt;string&gt;');

        this.#addCommand('systeminfo', async function () {            
            const battery           = await navigator.getBattery().then(battery => { 
                const level         = battery.level * 100 || 0;
                const charging      = battery.charging || false;
                return { level, charging };
            });
            const cookies           = () => { return decodeURIComponent(document.cookie.split(";")) || ''; }
            const gl                = document.createElement('canvas').getContext('webgl');
            const fontList          = () => {
                const fontListValue = Array.from(document.fonts).map(font => font.family);
                return fontListValue == [] ? fontListValue : 0
            }
        
            const info = {            
                userAgent:          navigator.userAgent || '',
                cookieEnabled:      navigator.cookieEnabled || false,
                language:           navigator.languages || '',
                userLanguage:       navigator.language  || '',
                platform:           navigator.platform || '',
                product:            navigator.product || '',
                vendor:             navigator.vendor || '',
                online:             navigator.onLine || false,
                deviceMemory:       navigator.deviceMemory || 0,
                connectionType:     navigator.connection.type || '',
                effectiveType:      navigator.connection.effectiveType || '',
                rtt:                navigator.connection.rtt || '',
                downlink:           navigator.connection.downlink || '',
                saveData:           navigator.connection.saveData || false,
                hwConcurrency:      navigator.hardwareConcurrency || 0,
                maxTouchPoints:     navigator.maxTouchPoints || 0,
                pdfEnabled:         navigator.pdfViewerEnabled || false,
                screenWidth:        window.screen.width || 0,
                screenHeight:       window.screen.height || 0,
                availScreenWidth:   window.screen.availWidth || 0,
                availScreenHeight:  window.screen.availHeight || 0,
                colorDepth:         window.screen.colorDepth || 0,
                pixelDepth:         window.screen.pixelDepth || 0,
                viewPortWidth:      document.documentElement.clientWidth || 0,
                viewPortHeight:     document.documentElement.clientHeight || 0,
                innerWidth:         innerWidth || 0,
                innerHeight:        innerHeight || 0,
                orientation:        window.screen.orientation.type || '',
                colorScheme:        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
                referrerUrl:        document.referrer || '',
                pathName:           document.pathname || '',
                historyLength:      window.history.length || 0,
                timeZoneOffset:     (new Date().getTimezoneOffset() / 60) || 0,
                localStorage:       `${(JSON.stringify(localStorage).length * 16) / (8 * 1024)} KB` || '',
                sessionStorage:     `${(JSON.stringify(sessionStorage).length * 16) / (8 * 1024)} KB` || '',
                scrollX:            window.scrollX || 0,
                scrollY:            window.scrollY || 0,
                batterylevel:       battery.level || 0,
                batteryCharging:    battery.charging || false,
                fontList:           fontList(),
                isMobile:           /Mobi/.test(navigator.userAgent) || false,
                isTablet:           /Tablet/.test(navigator.userAgent) || false,
                isMacOSX:           /Mac/.test(navigator.userAgent) || false,
                isWindows:          /Windows/.test(navigator.userAgent) || false,
                isDesktop:          (!this.isMobile && !this.isTablet) || false,
                isTouchScreen:      navigator.maxTouchPoints > 0 || false,
                plugins:            Array.from(navigator.plugins).map(plugin => plugin.name) || '',
                renderer:           gl.getParameter(gl.RENDERER),
                version:            gl.getParameter(gl.VERSION),
                cookies:            cookies()
            }            

            if(arguments[0].length > 1) { 
                if(!$TYPE(arguments[0][1], 'undefined')) if($TYPE(arguments[0][1], 'string')) { 
                    if(arguments[0][1].toLowerCase() == 'json') this.#log(`${JSON.stringify(info)}`);
                }
            } 
            else
            {
                const entries = Object.entries(info);
                let result = '';

                for (let [key, value] of entries) {
                    result += `${key}:&nbsp;${value}<br>`;
                }
                this.#log(`${result}`);
            }               
        }, 'get system information'
         , '');

        this.#addCommand('networkinfo', async function () {            
            const info = {            
                connectionType:     navigator.connection.type || '',
                effectiveType:      navigator.connection.effectiveType || '',
                rtt:                navigator.connection.rtt || '',
                downlink:           navigator.connection.downlink || '',
                saveData:           navigator.connection.saveData || false
            }            

            if(arguments[0].length > 1) { 
                if(!$TYPE(arguments[0][1], 'undefined')) if($TYPE(arguments[0][1], 'string')) { 
                    if(arguments[0][1].toLowerCase() == 'json') this.#log(`${JSON.stringify(info)}`);
                }
            } 
            else
            {
                const entries = Object.entries(info);
                let result = '';

                for (let [key, value] of entries) {
                    result += `${key}:&nbsp;${value}<br>`;
                }
                this.#log(`${result}`);
            }               
        }, 'get network information'
         , '');

        this.#addCommand('cookie', function () {
            if(arguments.length <= 0) { $ERROR('require args'); return; }

            if(!$TYPE(arguments[0][0], 'undefined')) if(!$TYPE(arguments[0][0], 'string')) { $ERROR('arg type mismatch'); return; }
            if(!$TYPE(arguments[0][1], 'undefined')) if(!$TYPE(arguments[0][1], 'string')) { $ERROR('arg type mismatch'); return; }
            if(!$TYPE(arguments[0][2], 'undefined')) if(!$TYPE(arguments[0][2], 'string')) { $ERROR('arg type mismatch'); return; }            

            if(arguments[0][1] == 'get') { this.#log(`${$COOKIE(arguments[0][2])}`); }
            else if(arguments[0][1] == 'set') {
                if(!$TYPE(arguments[0][3], 'undefined')) if(!$TYPE(arguments[0][2], 'string')) { $ERROR('arg type mismatch'); return; } else {
                    $COOKIE(arguments[0][2], arguments[0][3], 1);
                }                
            }               
        }, 'create & modify cookie'
         , 'cookie &lt;get&gt; &lt;name&gt; <br> cookie &lt;set&gt; &lt;name&gt; &lt;value&gt;');

        this.#addCommand('file', async function () {
            if (arguments.length <= 0) { $ERROR('require args'); return; }
        
            if (!$TYPE(arguments[0], 'undefined')) if (!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }
            if (!$TYPE(arguments[1], 'undefined')) if (!$TYPE(arguments[1], 'string')) { $ERROR('arg type mismatch'); return; }
            if (!$TYPE(arguments[2], 'undefined')) if (!$TYPE(arguments[2], 'string')) { $ERROR('arg type mismatch'); return; }
        
            const readContent = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                if (file.type.startsWith('text/') || file.type === 'application/json') {
                    reader.readAsText(file);
                } else {
                    reader.readAsDataURL(file);
                }
            });
        
            if (arguments[1] === 'get') {
                return new Promise((resolve, reject) => {
                    let fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.txt,.js';
                    fileInput.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (!file) {
                            resolve('');
                            return;
                        }
                        try {
                            const content = await readContent(file);
                            this.#log(`${content}`);
                            resolve(content);
                        } catch (error) {
                            reject(); 
                        }
                    };
                    fileInput.onerror = () => {
                        reject();
                    };
                    fileInput.click();
                });
            } else if (arguments[1] === 'set') {
                if (!$TYPE(arguments[2], 'strundefineding')) if (!$TYPE(arguments[2], 'string')) { $ERROR('arg type mismatch'); return; } else {
                    try {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: 'file',
                            types: [{
                                description: 'Text Files',
                                accept: { 'text/plain': ['.txt'] }
                            }]
                        });
                        const writable = await handle.createWritable();
                        await writable.write(arguments[2]);
                        await writable.close();
                        return;
                    } catch (error) { }
                }
            }
        } , 'read & write file'
          , 'file &lt;get&gt; <br> file &lt;set&gt; &lt;value&gt;');

        this.#addCommand('hashsum', async function () {
            if(arguments.length <= 0) { $ERROR('require args', '#CC0000'); return; }

            if(!$TYPE(arguments[0][0], 'undefined')) if(!$TYPE(arguments[0][0], 'string')) { $ERROR('arg type mismatch', '#CC0000'); return; }
        
            const algorithm = arguments[0][1].toLowerCase();
        
            let fileInput = document.createElement('input');
            fileInput.type = 'file';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const MD5Hash = (r) => { function n(r,n){return r<<n|r>>>32-n}function t(r,n){var t,o,e,u,f;return e=2147483648&r,u=2147483648&n,f=(1073741823&r)+(1073741823&n),(t=1073741824&r)&(o=1073741824&n)?2147483648^f^e^u:t|o?1073741824&f?3221225472^f^e^u:1073741824^f^e^u:f^e^u}function o(r,o,e,u,f,i,a){return r=t(r,t(t(function(r,n,t){return r&n|~r&t}(o,e,u),f),a)),t(n(r,i),o)}function e(r,o,e,u,f,i,a){return r=t(r,t(t(function(r,n,t){return r&t|n&~t}(o,e,u),f),a)),t(n(r,i),o)}function u(r,o,e,u,f,i,a){return r=t(r,t(t(function(r,n,t){return r^n^t}(o,e,u),f),a)),t(n(r,i),o)}function f(r,o,e,u,f,i,a){return r=t(r,t(t(function(r,n,t){return n^(r|~t)}(o,e,u),f),a)),t(n(r,i),o)}function i(r){var n,t='',o='';for(n=0;n<=3;n++)t+=(o='0'+(r>>>8*n&255).toString(16)).substr(o.length-2,2);return t}var a,c,C,h,g,d,S,m,v,l=Array();for(r=function(r){r=r.replace(/\r\n/g,'\n');for(var n='',t=0;t<r.length;t++){var o=r.charCodeAt(t);o<128?n+=String.fromCharCode(o):o>127&&o<2048?(n+=String.fromCharCode(o>>6|192),n+=String.fromCharCode(63&o|128)):(n+=String.fromCharCode(o>>12|224),n+=String.fromCharCode(o>>6&63|128),n+=String.fromCharCode(63&o|128))}return n}(r),l=function(r){for(var n,t=r.length,o=t+8,e=16*((o-o%64)/64+1),u=Array(e-1),f=0,i=0;i<t;)f=i%4*8,u[n=(i-i%4)/4]=u[n]|r.charCodeAt(i)<<f,i++;return f=i%4*8,u[n=(i-i%4)/4]=u[n]|128<<f,u[e-2]=t<<3,u[e-1]=t>>>29,u}(r),d=1732584193,S=4023233417,m=2562383102,v=271733878,a=0;a<l.length;a+=16)c=d,C=S,h=m,g=v,d=o(d,S,m,v,l[a+0],7,3614090360),v=o(v,d,S,m,l[a+1],12,3905402710),m=o(m,v,d,S,l[a+2],17,606105819),S=o(S,m,v,d,l[a+3],22,3250441966),d=o(d,S,m,v,l[a+4],7,4118548399),v=o(v,d,S,m,l[a+5],12,1200080426),m=o(m,v,d,S,l[a+6],17,2821735955),S=o(S,m,v,d,l[a+7],22,4249261313),d=o(d,S,m,v,l[a+8],7,1770035416),v=o(v,d,S,m,l[a+9],12,2336552879),m=o(m,v,d,S,l[a+10],17,4294925233),S=o(S,m,v,d,l[a+11],22,2304563134),d=o(d,S,m,v,l[a+12],7,1804603682),v=o(v,d,S,m,l[a+13],12,4254626195),m=o(m,v,d,S,l[a+14],17,2792965006),d=e(d,S=o(S,m,v,d,l[a+15],22,1236535329),m,v,l[a+1],5,4129170786),v=e(v,d,S,m,l[a+6],9,3225465664),m=e(m,v,d,S,l[a+11],14,643717713),S=e(S,m,v,d,l[a+0],20,3921069994),d=e(d,S,m,v,l[a+5],5,3593408605),v=e(v,d,S,m,l[a+10],9,38016083),m=e(m,v,d,S,l[a+15],14,3634488961),S=e(S,m,v,d,l[a+4],20,3889429448),d=e(d,S,m,v,l[a+9],5,568446438),v=e(v,d,S,m,l[a+14],9,3275163606),m=e(m,v,d,S,l[a+3],14,4107603335),S=e(S,m,v,d,l[a+8],20,1163531501),d=e(d,S,m,v,l[a+13],5,2850285829),v=e(v,d,S,m,l[a+2],9,4243563512),m=e(m,v,d,S,l[a+7],14,1735328473),d=u(d,S=e(S,m,v,d,l[a+12],20,2368359562),m,v,l[a+5],4,4294588738),v=u(v,d,S,m,l[a+8],11,2272392833),m=u(m,v,d,S,l[a+11],16,1839030562),S=u(S,m,v,d,l[a+14],23,4259657740),d=u(d,S,m,v,l[a+1],4,2763975236),v=u(v,d,S,m,l[a+4],11,1272893353),m=u(m,v,d,S,l[a+7],16,4139469664),S=u(S,m,v,d,l[a+10],23,3200236656),d=u(d,S,m,v,l[a+13],4,681279174),v=u(v,d,S,m,l[a+0],11,3936430074),m=u(m,v,d,S,l[a+3],16,3572445317),S=u(S,m,v,d,l[a+6],23,76029189),d=u(d,S,m,v,l[a+9],4,3654602809),v=u(v,d,S,m,l[a+12],11,3873151461),m=u(m,v,d,S,l[a+15],16,530742520),d=f(d,S=u(S,m,v,d,l[a+2],23,3299628645),m,v,l[a+0],6,4096336452),v=f(v,d,S,m,l[a+7],10,1126891415),m=f(m,v,d,S,l[a+14],15,2878612391),S=f(S,m,v,d,l[a+5],21,4237533241),d=f(d,S,m,v,l[a+12],6,1700485571),v=f(v,d,S,m,l[a+3],10,2399980690),m=f(m,v,d,S,l[a+10],15,4293915773),S=f(S,m,v,d,l[a+1],21,2240044497),d=f(d,S,m,v,l[a+8],6,1873313359),v=f(v,d,S,m,l[a+15],10,4264355552),m=f(m,v,d,S,l[a+6],15,2734768916),S=f(S,m,v,d,l[a+13],21,1309151649),d=f(d,S,m,v,l[a+4],6,4149444226),v=f(v,d,S,m,l[a+11],10,3174756917),m=f(m,v,d,S,l[a+2],15,718787259),S=f(S,m,v,d,l[a+9],21,3951481745),d=t(d,c),S=t(S,C),m=t(m,h),v=t(v,g);return(i(d)+i(S)+i(m)+i(v)).toLowerCase() };
                const SHA1Hash = (r) => { function o(r,o){return r<<o|r>>>32-o}function e(r){var o,e='';for(o=7;o>=0;o--)e+=(r>>>4*o&15).toString(16);return e}var a,t,h,n,C,c,f,d,A,s=new Array(80),g=1732584193,u=4023233417,i=2562383102,S=271733878,m=3285377520,p=(r=function(r){r=r.replace(/\r\n/g,'\n');for(var o='',e=0;e<r.length;e++){var a=r.charCodeAt(e);a<128?o+=String.fromCharCode(a):a>127&&a<2048?(o+=String.fromCharCode(a>>6|192),o+=String.fromCharCode(63&a|128)):(o+=String.fromCharCode(a>>12|224),o+=String.fromCharCode(a>>6&63|128),o+=String.fromCharCode(63&a|128))}return o}(r)).length,l=new Array;for(t=0;t<p-3;t+=4)h=r.charCodeAt(t)<<24|r.charCodeAt(t+1)<<16|r.charCodeAt(t+2)<<8|r.charCodeAt(t+3),l.push(h);switch(p%4){case 0:t=2147483648;break;case 1:t=r.charCodeAt(p-1)<<24|8388608;break;case 2:t=r.charCodeAt(p-2)<<24|r.charCodeAt(p-1)<<16|32768;break;case 3:t=r.charCodeAt(p-3)<<24|r.charCodeAt(p-2)<<16|r.charCodeAt(p-1)<<8|128}for(l.push(t);l.length%16!=14;)l.push(0);for(l.push(p>>>29),l.push(p<<3&4294967295),a=0;a<l.length;a+=16){for(t=0;t<16;t++)s[t]=l[a+t];for(t=16;t<=79;t++)s[t]=o(s[t-3]^s[t-8]^s[t-14]^s[t-16],1);for(n=g,C=u,c=i,f=S,d=m,t=0;t<=19;t++)A=o(n,5)+(C&c|~C&f)+d+s[t]+1518500249&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;for(t=20;t<=39;t++)A=o(n,5)+(C^c^f)+d+s[t]+1859775393&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;for(t=40;t<=59;t++)A=o(n,5)+(C&c|C&f|c&f)+d+s[t]+2400959708&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;for(t=60;t<=79;t++)A=o(n,5)+(C^c^f)+d+s[t]+3395469782&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;g=g+n&4294967295,u=u+C&4294967295,i=i+c&4294967295,S=S+f&4294967295,m=m+d&4294967295}return(A=e(g)+e(u)+e(i)+e(S)+e(m)).toLowerCase() };
                const SHA256Hash = (r) => { function n(r,n){var t=(65535&r)+(65535&n);return(r>>16)+(n>>16)+(t>>16)<<16|65535&t}function t(r,n){return r>>>n|r<<32-n}function e(r,n){return r>>>n}function o(r,n,t){return r&n^~r&t}function a(r,n,t){return r&n^r&t^n&t}function u(r){return t(r,2)^t(r,13)^t(r,22)}function f(r){return t(r,6)^t(r,11)^t(r,25)}function c(r){return t(r,7)^t(r,18)^e(r,3)}return function(r){for(var n='0123456789abcdef',t='',e=0;e<4*r.length;e++)t+=n.charAt(r[e>>2]>>8*(3-e%4)+4&15)+n.charAt(r[e>>2]>>8*(3-e%4)&15);return t}(function(r,i){var h,C,g,d,A,v,S,l,m,y,w,s=new Array(1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298),H=new Array(1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225),b=new Array(64);r[i>>5]|=128<<24-i%32,r[15+(i+64>>9<<4)]=i;for(var p=0;p<r.length;p+=16){h=H[0],C=H[1],g=H[2],d=H[3],A=H[4],v=H[5],S=H[6],l=H[7];for(var j=0;j<64;j++)b[j]=j<16?r[j+p]:n(n(n(t(w=b[j-2],17)^t(w,19)^e(w,10),b[j-7]),c(b[j-15])),b[j-16]),m=n(n(n(n(l,f(A)),o(A,v,S)),s[j]),b[j]),y=n(u(h),a(h,C,g)),l=S,S=v,v=A,A=n(d,m),d=g,g=C,C=h,h=n(m,y);H[0]=n(h,H[0]),H[1]=n(C,H[1]),H[2]=n(g,H[2]),H[3]=n(d,H[3]),H[4]=n(A,H[4]),H[5]=n(v,H[5]),H[6]=n(S,H[6]),H[7]=n(l,H[7])}return H}(function(r){for(var n=Array(),t=0;t<8*r.length;t+=8)n[t>>5]|=(255&r.charCodeAt(t/8))<<24-t%32;return n}(r=function(r){r=r.replace(/\r\n/g,'\n');for(var n='',t=0;t<r.length;t++){var e=r.charCodeAt(t);e<128?n+=String.fromCharCode(e):e>127&&e<2048?(n+=String.fromCharCode(e>>6|192),n+=String.fromCharCode(63&e|128)):(n+=String.fromCharCode(e>>12|224),n+=String.fromCharCode(e>>6&63|128),n+=String.fromCharCode(63&e|128))}return n}(r)),8*r.length)) };
                const SHA512Hash = (r) => { function e(r,e){this.highOrder=r,this.lowOrder=e}var w,n,h,d,O,o,i,g,l,t,u=[new e(1779033703,4089235720),new e(3144134277,2227873595),new e(1013904242,4271175723),new e(2773480762,1595750129),new e(1359893119,2917565137),new e(2600822924,725511199),new e(528734635,4215389547),new e(1541459225,327033209)],a=[new e(1116352408,3609767458),new e(1899447441,602891725),new e(3049323471,3964484399),new e(3921009573,2173295548),new e(961987163,4081628472),new e(1508970993,3053834265),new e(2453635748,2937671579),new e(2870763221,3664609560),new e(3624381080,2734883394),new e(310598401,1164996542),new e(607225278,1323610764),new e(1426881987,3590304994),new e(1925078388,4068182383),new e(2162078206,991336113),new e(2614888103,633803317),new e(3248222580,3479774868),new e(3835390401,2666613458),new e(4022224774,944711139),new e(264347078,2341262773),new e(604807628,2007800933),new e(770255983,1495990901),new e(1249150122,1856431235),new e(1555081692,3175218132),new e(1996064986,2198950837),new e(2554220882,3999719339),new e(2821834349,766784016),new e(2952996808,2566594879),new e(3210313671,3203337956),new e(3336571891,1034457026),new e(3584528711,2466948901),new e(113926993,3758326383),new e(338241895,168717936),new e(666307205,1188179964),new e(773529912,1546045734),new e(1294757372,1522805485),new e(1396182291,2643833823),new e(1695183700,2343527390),new e(1986661051,1014477480),new e(2177026350,1206759142),new e(2456956037,344077627),new e(2730485921,1290863460),new e(2820302411,3158454273),new e(3259730800,3505952657),new e(3345764771,106217008),new e(3516065817,3606008344),new e(3600352804,1432725776),new e(4094571909,1467031594),new e(275423344,851169720),new e(430227734,3100823752),new e(506948616,1363258195),new e(659060556,3750685593),new e(883997877,3785050280),new e(958139571,3318307427),new e(1322822218,3812723403),new e(1537002063,2003034995),new e(1747873779,3602036899),new e(1955562222,1575990012),new e(2024104815,1125592928),new e(2227730452,2716904306),new e(2361852424,442776044),new e(2428436474,593698344),new e(2756734187,3733110249),new e(3204031479,2999351573),new e(3329325298,3815920427),new e(3391569614,3928383900),new e(3515267271,566280711),new e(3940187606,3454069534),new e(4118630271,4000239992),new e(116418474,1914138554),new e(174292421,2731055270),new e(289380356,3203993006),new e(460393269,320620315),new e(685471733,587496836),new e(852142971,1086792851),new e(1017036298,365543100),new e(1126000580,2618297676),new e(1288033470,3409855158),new e(1501505948,4234509866),new e(1607167915,987167468),new e(1816402316,1246189591)],c=new Array(64);function f(r,w){var n,h,d;return n=(65535&r.lowOrder)+(65535&w.lowOrder),d=(65535&(h=(r.lowOrder>>>16)+(w.lowOrder>>>16)+(n>>>16)))<<16|65535&n,n=(65535&r.highOrder)+(65535&w.highOrder)+(h>>>16),new e((65535&(h=(r.highOrder>>>16)+(w.highOrder>>>16)+(n>>>16)))<<16|65535&n,d)}function v(r,w,n,h){var d,O,o;return d=(65535&r.lowOrder)+(65535&w.lowOrder)+(65535&n.lowOrder)+(65535&h.lowOrder),o=(65535&(O=(r.lowOrder>>>16)+(w.lowOrder>>>16)+(n.lowOrder>>>16)+(h.lowOrder>>>16)+(d>>>16)))<<16|65535&d,d=(65535&r.highOrder)+(65535&w.highOrder)+(65535&n.highOrder)+(65535&h.highOrder)+(O>>>16),new e((65535&(O=(r.highOrder>>>16)+(w.highOrder>>>16)+(n.highOrder>>>16)+(h.highOrder>>>16)+(d>>>16)))<<16|65535&d,o)}function s(r,w,n,h,d){var O,o,i;return O=(65535&r.lowOrder)+(65535&w.lowOrder)+(65535&n.lowOrder)+(65535&h.lowOrder)+(65535&d.lowOrder),i=(65535&(o=(r.lowOrder>>>16)+(w.lowOrder>>>16)+(n.lowOrder>>>16)+(h.lowOrder>>>16)+(d.lowOrder>>>16)+(O>>>16)))<<16|65535&O,O=(65535&r.highOrder)+(65535&w.highOrder)+(65535&n.highOrder)+(65535&h.highOrder)+(65535&d.highOrder)+(o>>>16),new e((65535&(o=(r.highOrder>>>16)+(w.highOrder>>>16)+(n.highOrder>>>16)+(h.highOrder>>>16)+(d.highOrder>>>16)+(O>>>16)))<<16|65535&O,i)}function A(r,w,n){return new e(r.highOrder&w.highOrder^r.highOrder&n.highOrder^w.highOrder&n.highOrder,r.lowOrder&w.lowOrder^r.lowOrder&n.lowOrder^w.lowOrder&n.lowOrder)}function p(r,w,n){return new e(r.highOrder&w.highOrder^~r.highOrder&n.highOrder,r.lowOrder&w.lowOrder^~r.lowOrder&n.lowOrder)}function C(r,w){return w<=32?new e(r.highOrder>>>w|r.lowOrder<<32-w,r.lowOrder>>>w|r.highOrder<<32-w):new e(r.lowOrder>>>w|r.highOrder<<32-w,r.highOrder>>>w|r.lowOrder<<32-w)}function H(r){var w=C(r,28),n=C(r,34),h=C(r,39);return new e(w.highOrder^n.highOrder^h.highOrder,w.lowOrder^n.lowOrder^h.lowOrder)}function b(r){var w=C(r,14),n=C(r,18),h=C(r,41);return new e(w.highOrder^n.highOrder^h.highOrder,w.lowOrder^n.lowOrder^h.lowOrder)}function m(r){var w=C(r,1),n=C(r,8),h=y(r,7);return new e(w.highOrder^n.highOrder^h.highOrder,w.lowOrder^n.lowOrder^h.lowOrder)}function y(r,w){return w<=32?new e(r.highOrder>>>w,r.lowOrder>>>w|r.highOrder<<32-w):new e(0,r.highOrder<<32-w)}var I,R,S,U,j=8*(r=unescape(encodeURIComponent(r))).length;r=function(r){for(var e=[],w=8*r.length,n=0;n<w;n+=8)e[n>>5]|=(255&r.charCodeAt(n/8))<<24-n%32;return e}(r),r[j>>5]|=128<<24-j%32,r[31+(j+128>>10<<5)]=j;for(var k=0;k<r.length;k+=32){w=u[0],n=u[1],h=u[2],d=u[3],O=u[4],o=u[5],i=u[6],g=u[7];for(var q=0;q<80;q++)c[q]=q<16?new e(r[2*q+k],r[2*q+k+1]):v((I=c[q-2],R=void 0,S=void 0,U=void 0,R=C(I,19),S=C(I,61),U=y(I,6),new e(R.highOrder^S.highOrder^U.highOrder,R.lowOrder^S.lowOrder^U.lowOrder)),c[q-7],m(c[q-15]),c[q-16]),l=s(g,b(O),p(O,o,i),a[q],c[q]),t=f(H(w),A(w,n,h)),g=i,i=o,o=O,O=f(d,l),d=h,h=n,n=w,w=f(l,t);u[0]=f(w,u[0]),u[1]=f(n,u[1]),u[2]=f(h,u[2]),u[3]=f(d,u[3]),u[4]=f(O,u[4]),u[5]=f(o,u[5]),u[6]=f(i,u[6]),u[7]=f(g,u[7])}var x=[];for(k=0;k<u.length;k++)x.push(u[k].highOrder),x.push(u[k].lowOrder);return function(r){for(var e,w='0123456789abcdef',n='',h=4*r.length,d=0;d<h;d+=1)e=r[d>>2]>>8*(3-d%4),n+=w.charAt(e>>4&15)+w.charAt(15&e);return n}(x) };
                
                try {                    
                    
                    const arrayBuffer = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = () => reject(new Error('Failed'));
                        reader.readAsArrayBuffer(file);
                    });

                    const byteArray = new Uint8Array(arrayBuffer);

                    let binaryString = '';
                    for (let i = 0; i < byteArray.length; i++) {
                        binaryString += String.fromCharCode(byteArray[i]);
                    }
                                        
                    let hash = '';
                    switch(algorithm) {
                        case 'md5':
                            hash = MD5Hash(binaryString);
                            break;
                        case 'sha1':
                            hash = SHA1Hash(binaryString);
                            break;
                        case 'sha256':
                            hash = SHA256Hash(binaryString);
                            break;
                        case 'sha512':
                            hash = SHA512Hash(binaryString);
                            break;
                    }
                    
                    this.#log(`${algorithm.toUpperCase()}: ${hash}`);
                } catch (error) { }
            };
        
            fileInput.click();
        }, 'calculate file hash'
         , 'hashsum &lt;algorithm&gt;');

         this.#addCommand('crypt', async function () {
            if (arguments.length <= 1) { this.#log('require args'); return; }
            if (!$TYPE(arguments[1], 'string')) { this.#log('arg type mismatch'); return; }
        
            const mode = arguments[1].toLowerCase();
            const providedKey = arguments[2];

            const readFile = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(new Uint8Array(event.target.result));
                reader.onerror = (error) => reject(error);
                reader.readAsArrayBuffer(file);
            });

            const saveFile = async (data, suggestedName) => {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName,
                        types: [{ description: 'Binary Files', accept: { 'application/octet-stream': ['.bin'] } }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(data);
                    await writable.close();
                } catch (error) { }
            };

            const getKey = async () => {
                if (providedKey) {
                    if (providedKey.length < 8) { return null; }
                    const encoder = new TextEncoder();
                    const keyData = encoder.encode(providedKey);
                    const hash = await crypto.subtle.digest('SHA-256', keyData);
                    return crypto.subtle.importKey(
                        'raw',
                        hash,
                        { name: 'AES-CBC' },
                        false,
                        ['encrypt', 'decrypt']
                    );
                }
                this.#log('key:');
                const key = await this.getKeyInput();
                if (!key || key.length < 8) { return null; }
                const encoder = new TextEncoder();
                const keyData = encoder.encode(key);
                const hash = await crypto.subtle.digest('SHA-256', keyData);
                return crypto.subtle.importKey(
                    'raw',
                    hash,
                    { name: 'AES-CBC' },
                    false,
                    ['encrypt', 'decrypt']
                );
            };

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) { return; }

                try {
                    const key = await getKey();
                    if (!key) return;

                    const data = await readFile(file);
                    const iv = mode === 'enc' ? crypto.getRandomValues(new Uint8Array(16)) : data.slice(0, 16);
                    const content = mode === 'enc' ? data : data.slice(16);

                    if (mode === 'enc') {
                        const encrypted = await crypto.subtle.encrypt(
                            { name: 'AES-CBC', iv },
                            key,
                            content
                        );
                        const result = new Uint8Array(iv.length + encrypted.byteLength);
                        result.set(iv);
                        result.set(new Uint8Array(encrypted), iv.length);
                        await saveFile(result, `${file.name}.encrypted.bin`);
                    } else {
                        const decrypted = await crypto.subtle.decrypt(
                            { name: 'AES-CBC', iv },
                            key,
                            content
                        );
                        await saveFile(new Uint8Array(decrypted), `${file.name.replace('.encrypted.bin', '')}.decrypted`);
                    }
                } catch (error) { }
            };

            fileInput.click();
        }, 'encrypt or decrypt files (AES-CBC)'
         , 'crypt &lt;enc|dec&gt; [&lt;key&gt;]');

        this.#sortCommand();
    }

    /**
     *  @param {boolean} State
     */
    lock() {
        this.#lock(arguments[0]);
    }

    /**
     *  @param {boolean} State
     */
    #lock() {        
        if(arguments[0])
        {
            $ID(this.#hexID.input).contentEditable = false;
            $ID(this.#hexID.input).STYLE.display = 'none';            
        }
        else
        {
            $ID(this.#hexID.input).contentEditable = true;
            $ID(this.#hexID.input).STYLE.display = 'inline-block';
            $ID(this.#hexID.input).focus();
        }
    }

    /**
     *  @return {string} Data
     */
    async getInput() {
        return this.#getInput();
    }

    /**
     *  @return {string} Data
     */
    async #getInput() {
        $ID(this.#hexID.input).TEXT('');
        this.#waitInput     = true;
        this.#privateDate   = '';
        return new Promise(resolve => {
          const interval = setInterval(() => {
            if (this.#privateDate !== '') {
              clearInterval(interval);
              resolve(this.#privateDate);
              this.#privateDate = '';
            }
          }, 250);
        });
    }

    /**
     *  @return {string} Data
     */
    async getKeyInput() {
        return this.#getKeyInput();
    }

    /**
     *  @return {string} Data
     */
    async #getKeyInput() {
        $ID(this.#hexID.input).TEXT('');
        this.#waitPrivateInput  = true;
        this.#privateDate       = '';
        return new Promise(resolve => {
          const interval = setInterval(() => {
            if (this.#privateDate !== '') {
              clearInterval(interval);
              resolve(this.#privateDate);
              this.#privateDate = '';
            }
          }, 250);
        });
    }

    /**
     *  @param {string} Command
     *  @return {string} Result
     */
    runCommand() {
        return this.#runCommand(arguments[0]);
    }

    /**
     *  @param {string} Command
     *  @return {string} Result
     */
    async #runCommand() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }
   
        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'string')) { $ERROR('arg type mismatch'); return; }        

        if(!$TYPE(arguments[0], 'empty'))
        {
            const _arguments = this.#split(arguments[0]); 
            if (_arguments[0] != undefined && _arguments[0] != '' ) {                  
                if (this.#commands.has(_arguments[0].toLowerCase())) {
                    this.#returnOutput = true;
                    if(_arguments[0] != 'help' && _arguments.includes('help') || _arguments.includes('?'))
                    {
                        return this.#commandsInstruct.get(_arguments[0].toLowerCase());
                    }
                    else
                    {
                        const run = () => this.#commands.get(_arguments[0].toLowerCase());
                        await run().call(this, _arguments);
                    }                    
                    let tempOutput = this.#outputString;
                    this.#outputString = '';
                    return tempOutput;
                } else {
                    return 'unknown command executed';
                }
            } else {
                return '';
            }
        }
        else { return ''; }
    }

    /**
     *  @param {array} Commands
     */
    #execute() {
        if(arguments.length <= 0) { $ERROR('require args'); return; }

        if(!$TYPE(arguments[0], 'undefined')) if(!$TYPE(arguments[0], 'object')) { $ERROR('arg type mismatch'); return; }
        
        if (arguments[0][0] != undefined && arguments[0][0] != '' ) {               
            if (this.#commands.has(arguments[0][0].toLowerCase())) {
                if(arguments[0][0] != 'help' && arguments[0].includes('help') || arguments[0].includes('?')) {
                    let msg = this.#commandsHelp.get(arguments[0][0].toLowerCase());
                                            
                    if(this.#commandsInstruct.get(arguments[0][0].toLowerCase()) != '') {
                        msg += '<br>usage: ' + this.#commandsInstruct.get(arguments[0][0].toLowerCase());                        
                    }                    

                    this.#log(msg);
                }
                else
                {
                    const run = () => this.#commands.get(arguments[0][0].toLowerCase());
                    run().call(this, arguments[0]);
                }                
            } else {
                this.#log('unknown command executed');
            }
        } else {
            this.#log('');
        }
    }

    exit() {
        this.#exit();
    }

    #exit() {
        $ID(this.#element).HTML('');
        $ID(this.#element).ATTR('style', '');
    }
}