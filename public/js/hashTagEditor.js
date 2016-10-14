/*
	author : onekwan
	email : onekwanson@gmail.com
	version : 1.0.0
	github : https://github.com/ilgwonson/hashtageditor
 */

(function(window,$) {
	if (window.bindHashtagEditor) return false;
	
	window.bindHashtagEditor = function(obj,options) {
		var instance,objArray = [],
		    returnArray = [];
		if (!obj)
			return false;
		if(obj instanceof Array){
			objArray = obj
		}else if(obj instanceof $){
			for(var k=0;k<obj.length;k++){
				objArray.push(obj.eq(k).get(0));
			}
		}else{
			objArray.push(obj);
		}
		for (var i = 0; i < objArray.length; i++) {
			if (objArray[i] && (objArray[i].nodeName.toUpperCase() == "TEXTAREA" || (objArray[i].nodeName.toUpperCase() == "DIV" && objArray[i].contentEditable))){
				instance = new HashTagEditor(objArray[i], options);
				instance._init();
				returnArray.push(instance); //객체 배열을 반환해줌
			}				
		}
		return returnArray;
	}
	
	var blankHTML = "<br>"; //빈공간 row 에 들어갈 텍스트 - ie를 제외한 브라우저는 br이 있어야 커서 위치를 잡을수 있음
	
	var keyboard = { //keycode
		backspace : 8,
		enter : 13,
		space : 32,
		end : 35,
		home : 36,
		del : 46,
		arr_left : 37,
		arr_up : 38,
		arr_right : 39,
		arr_down : 40,
		copy_c : 67,
		shift : 16
	}

	var windowSelection = window.getSelection();

	setVariable();
	
	function setVariable() {
		if (getBrowserType() == "explore" && ieVersionCheck() < 11) {
			blankHTML = "";  //익스플로어는 br이 들어가면 div안에 두줄이 생김
		}
	}
	
	var defaultOptions = { //기본 옵션 값
		classNames : {
			lineClassName : "hashtag-editor-line",
			spanClassName : "hashtag-span",
			hashtagClassName : "hashtag-em",
			placeholderClassName : "hashtag-placeholder"
		},
		placeHolder : ""
	}

	var HashTagEditor = function(obj, options) {
		this.container = obj;
		this.editor = null;
		this.options = defaultOptions;
		extend(this.options,options);
		this.classNames = this.options.classNames;
		this.placeHolder = this.options.placeHolder;
		this.init = true;
	}
	
	HashTagEditor.prototype._init = function() {
		if(this.container.nodeName.toUpperCase() == "TEXTAREA"){
			this.makeContentEditableHTML();
			this.initLines(this.container.value);	
		}else{
			this.editor = this.container;
			this.initLines(this.container.innerHTML);
		}
		this.addEvent();
		this.init_editorHeight = this.editorHeight = this.editor.offsetHeight - (parseInt(this.editor.style.paddingTop) + parseInt(this.editor.style.paddingBottom));
		this.heightOfLine = this.editor.getElementsByClassName(this.classNames.lineClassName)[0].offsetHeight;
	}
	
	//textarea일 경우에는 
	//contenteditable Div로 바꾸어 준다.
	//스타일은 textarea와 동일하게 맞춘후 textarea를 히든 처리한다.
	HashTagEditor.prototype.makeContentEditableHTML = function() {
		var wrapper_div = document.createElement("div");
		var editor_div = document.createElement("div");
		wrapper_div.className = "hashtag-editor_wrapper";
		editor_div.className = "hashtag-editor";
		editor_div.contentEditable = true;
		editor_div["strip-br"] = true;
		var origin_dom_style = window.getComputedStyle(this.container);
		copyComputedStyle(this.container, editor_div);
		wrapper_div.appendChild(editor_div);
		wrapper_div.style.width = origin_dom_style.width;
		this.container.parentNode.insertBefore(wrapper_div, this.container);
		this.container.style.display = "none";
		wrapper_div.appendChild(this.container);

		this.editor = editor_div;
	}
	//에디터 기능일 경우 처음에 텍스트 랩핑
	HashTagEditor.prototype.initLines = function(text){
		if(removeTag(text)==""){
			this.editor.innerHTML = this.getRowNode("text",(this.placeHolder ? this.placeHolder: ""),this.init);
			return;
		}
		this.init = false;
		var type = this.container.getAttribute("data-edittype") || "1";
		var temp,res = "";
		switch(type){
			case "3" :
				res = text;
				break;
			case "2" :
				temp = text.split("<br>");
				for(var i=0;i<temp.length;i++){
					res += this.getRowNode("text",temp[i]);
				}
				break;
			case "1" :
			default :
				temp = text.split("\n");	
				for(var i=0;i<temp.length;i++){
					res += this.getRowNode("text",temp[i]);
				}
				break;
		}
		this.editor.innerHTML = res;
		var lines = this.editor.getElementsByClassName(this.classNames.lineClassName);
		for(var i=0;i<lines.length;i++){
			console.log(i)
			this.f_editorChange({
				type : "init",
				currentLine : lines[i],
				notMove : true
			});
		}
	}
	//에디터에 작성된 값을 추출
	HashTagEditor.prototype.setTextValue = function(type){
		type = type ? type : 1;
		var res = "";
		var lines = this.editor.childNodes;
		switch(type){
			case 1 :
				for(var i=0;i<lines.length;i++){
					res += removeTag(lines[i].innerHTML) + "\n";
				}
				break;
			case 2 :
				for(var i=0;i<lines.length;i++){
					for(var j=0;j<lines[i].childNodes.length;j++){
						var node = lines[i].childNodes[j];
						if(node.nodeName.toUpperCase() == "SPAN" && node.className == this.classNames.hashtagClassName){
							res += "<span class='"+this.classNames.hashtagClassName+"'>"+node.innerHTML + "</span>";
						}else if(node.nodeName.toUpperCase() == "SPAN"){
							res += node.innerHTML;
						}
					}
					if(i!=lines.length-1){
						res += "<br>";	
					}
					
				}
				break;
			case 3 :
				res = this.editor.innerHTML;
				break;
				
		}
		if(this.container.nodeName.toUpperCase() == "TEXTAREA"){
			this.container.value = res;
		}
		return res;
	}

	HashTagEditor.prototype.focus = function() { 
		if(getBrowserType() == "firefox") return false; //firefox에서는 작동 안함
		var self = this;
		var tar = self.getLastChild();
		if(self.init){
			self.f_init();
		}
		setTimeout(function() {//ie는 setTimeout을 주어야 정상 작동
			var offset = getOffset(tar);
			setCaretPosition(getCursorTarget(tar), offset);
		}, 10);
	}
	
	function getOffset(node){ //ie에서 빈 row일 경우 span node의 textnode를 못찾기 때문에 0으로 설정
		var offset=0;
		if(node.childNodes.length){
			offset = node.childNodes[0].length ? node.childNodes[0].length : 0;
		}
		return offset;
	}

	HashTagEditor.prototype.getLastChild = function() { //에디터에서 맨마지막 span node 검색
		if(this.init) {
			return this.editor.childNodes[0].childNodes[0];
		}else{
			var tar = null;
			tar = this.editor.childNodes[this.editor.childNodes.length-1];
			tar = tar.childNodes[tar.childNodes.length-1];
			return tar;
		}

	}

	HashTagEditor.prototype.addEvent = function() {		
		var self = this;
		var keyDownRepeat=0,seltionKey,key_event_offset = 0;
		
		//처음 placeholde가 있을 경우 커서가 강제적으로 처음으로 이동하는 기능
		//파이어폭스 작동 안함
		self.editor.addEventListener("mousedown",function(e){
			if(self.init && getBrowserType() != "firefox"){
				e.preventDefault();
			}
		});
		self.editor.addEventListener("mouseup",function(e){
			var self2 = this;
			if(self.init){
				var tar = self.editor.getElementsByClassName(self.classNames.placeholderClassName);
				setTimeout(function() {//ie 10 to lower issue
					setCaretPosition(getCursorTarget(tar[0]), 0);
				}, 10);	
			}
		});


		self.editor.addEventListener("keydown", function(e){
			var keyCode = e.which || e.keycode;
			var currentLine = self.getTargetLine(windowSelection.focusNode);
			
			key_event_offset = getCaretCharacterOffsetWithin(windowSelection.anchorNode); //현재 키 위치 저장후 keyup에서 커서 위치 변했는지 검사
			keyDownRepeat++;//keydown이 연속적으로 발생할 경우 keydown에도 에디터 펑션 적용
			
			if(self.init){ //초기화
				self.f_init();
			}
			
			//조합키 사용할경우 에디터 기능을 잠시 중단하기 위한 flag 저장
			if(e.shiftKey == true && (keyCode == keyboard.end || keyCode == keyboard.home || keyCode == keyboard.arr_left || keyCode == keyboard.arr_up || keyCode == keyboard.arr_right || keyCode == keyboard.arr_down)) seltionKey=true; //select 범위 지정할경우에는 에디터 기능정지
			if(e.ctrlKey == true && keyCode == keyboard.copy_c) seltionKey=true;
			
			if(keyCode == keyboard.space && getBrowserType() == "firefox"){ //firefox " "이 하나일 경우 커서에서 글입력이 안됨 그래서 &nbsp;로 바꿔줌
				self.f_space(currentLine,e);
				e.preventDefault();
				return;
			}
			

			if(keyDownRepeat > 5){ //keydown 계속 중일 경우 keyup 없이도 글이 입력되기 때문에 에디터 기능 작동
				if (keyCode == keyboard.enter ||keyCode == keyboard.enter) {
					//에디터 크기 맞춰주기
					if(self.editorHeight<=self.heightOfLine * (self.editor.childNodes.length+1)){ //한줄더 여유 있게하기 위해서
						self.editorHeight = self.heightOfLine * (self.editor.childNodes.length+1);
						self.editor.style.height = self.editorHeight + "px";
					}
					self.f_enter(currentLine,e);
					return;
				}
				if (keyCode == keyboard.backspace || keyCode == keyboard.backspace || (e.shiftKey == true && keyCode == keyboard.del)) {
					//에디터 크기 맞춰주기
					if(self.editorHeight>self.heightOfLine * (self.editor.childNodes.length+1)){ //한줄더 여유 있게하기 위해서
						self.editorHeight = self.heightOfLine * (self.editor.childNodes.length+1);
						self.editor.style.height = Math.max(self.init_editorHeight,self.editorHeight) + "px";
					}
					self.f_backspace(currentLine,e);
					return;
				}
				self.f_editorChange({
					type : "1ch",
					currentLine : currentLine
				});
			}
		});
		self.editor.addEventListener("keyup", function(e) {
			keyDownRepeat = 0;
			var currentLine = self.getTargetLine(windowSelection.focusNode);
			var keyCode = e.which || e.keycode;
			var f_editorChange_type = "";
			
			if(!keyCode) return; //처음에 포커스 기능 사용하면 자동으로 키업이 한번 발생 그경우 키코드 없음
			
			var offset = getCaretCharacterOffsetWithin(windowSelection.anchorNode);
			//onsole.log("keydown : "+ offset);
			
			//한국어일 경우 한곳의 커서위치에서 여러번 글입력을 하기 때문에
			//커서위치가 바뀔때만 텍스트 랩핑 처리 기능 적용
			if(key_event_offset != offset && keyCode != keyboard.shift){
				var cursorText = windowSelection.anchorNode.data || windowSelection.anchorNode.innerHTML;
				var character_Byte = getByteLength(cursorText.substring(offset-1,offset));
				if(character_Byte<3){
					f_editorChange_type = "1ch";	
				}
			}
			
			//혼합키 사용후에 키업되는 shift에 대해서는 텍스트 랩핑 기능 작동 안함
			if(seltionKey){
				if(e.shiftKey == false && e.ctrlKey == false){
					seltionKey = false;
				}
				return;
			}
			if (keyCode == keyboard.enter ||keyCode == keyboard.enter) {
				if(self.editorHeight<=self.heightOfLine * (self.editor.childNodes.length+1)){ //한줄더 여유 있게하기 위해서
					self.editorHeight = self.heightOfLine * (self.editor.childNodes.length+1);
					self.editor.style.height = self.editorHeight + "px";
				}
				self.f_enter(currentLine,e);
				return;
			}
			if (keyCode == keyboard.backspace || keyCode == keyboard.backspace || (e.shiftKey == true && keyCode == keyboard.del)) {
				if(self.editorHeight>self.heightOfLine * (self.editor.childNodes.length+1)){ //한줄더 여유 있게하기 위해서
					self.editorHeight = Math.max(self.init_editorHeight,(self.heightOfLine * (self.editor.childNodes.length+1)));
					self.editor.style.height = self.editorHeight + "px";
				}
				self.f_backspace(currentLine,e);
				return;
			}
			
			//커서가 이동했다는 것을 확인후 텍스트 랩핑 기능 사용
			if(f_editorChange_type){
				self.f_editorChange({
					type : f_editorChange_type,
					currentLine : currentLine,
				});	
			}
			
		});
		self.editor.addEventListener("paste", function(e) { //붙여넣기 할경우 텍스트만 뽑아내어 에디터 양식으로 포맷후 append
			var clipboardText = "";
			if (e.clipboardData) {
				clipboardText = e.clipboardData.getData('Text');
			}else if (window.clipboardData) {
				clipboardText = window.clipboardData.getData('Text');
			}else{
				e.preventDefault();
			}
			
			setTimeout(function() {
				if(getBrowserType() == "firefox"){
					clipboardText = clipboardText.split("\n");
				}else{
					clipboardText = clipboardText.split("\r\n");	
				}
				var caretOffset = getCaretCharacterOffsetWithin(windowSelection.focusNode);
				var span = self.getSpanWrapper(windowSelection.focusNode);
				var currentLine = self.getTargetLine(windowSelection.focusNode);
				var html = span.innerHTML.replace(/&nbsp;/ig," "); //&nbsp;일 경우 커서 위치랑 innerHTML의 텍스트 위치가 달라짐 (curosr = 1 ,innerHTml = 6) 
				html = html.substring(0, caretOffset) + clipboardText[0] + html.substring(caretOffset);//첫행은 커서 위치에서 시작되어 붙여넣기 함	
				html = html.replace(/ /ig, "&nbsp;"); //다시 바꿔줌
				span.innerHTML = html;

				if (clipboardText.length == 1) {
					setCaretPosition(getCursorTarget(span), caretOffset + clipboardText[0].length);
					self.f_editorChange({
						type : "paste", 
						currentLine : currentLine
					});
				} else { //여러줄일 경우 커서 위치 다음 부터 row를 생성하여 붙여넣기
					var nextLine;
					try{
						nextLine = currentLine.nextSibling;	
					}catch(e){
						nextLine = null;
					}
					var nodeArgs = [];
					for (var i = 1; i < clipboardText.length; i++) {
						if (nextLine) {
							nextLine.parentNode.insertBefore(self.getRowNode("node", clipboardText[i]), nextLine);
							self.f_editorChange({
								type : "paste", 
								currentLine : nextLine.previousSibling,
								notMove : true
							});
						} else {
							currentLine.parentNode.appendChild(self.getRowNode("node", clipboardText[i]));
							var arg_nextLine = currentLine.parentNode.childNodes[currentLine.parentNode.childNodes.length-1];
							self.f_editorChange({
								type : "paste", 
								currentLine : arg_nextLine,
								notMove : true
							});
						}
					}
					self.f_editorChange({
						type : "paste", 
						currentLine : currentLine
					});
					//커서는 맨마직 row 끝으로 이동
					if (nextLine) {
						var tar = nextLine.previousSibling.childNodes;
						tar = tar[tar.length-1];
						var offset = getOffset(tar);
						setCaretPosition(getCursorTarget(tar), offset);
					} else {
						var tar = currentLine.parentNode.childNodes;
						tar = tar[tar.length - 1];
						tar = tar.childNodes[tar.childNodes.length-1];
						var offset = getOffset(tar);
						setCaretPosition(getCursorTarget(tar), offset);
					}
				}

			}, 0);
			e.preventDefault();
		});
		self.editor.addEventListener("blur",function(){
			if(removeTag(self.editor.innerHTML)==""){
				self.init = true;
				self.editor.innerHTML = self.getRowNode("text",(self.placeHolder ? self.placeHolder: ""),self.init);
				return;
			}
		});
	}
	function extend(el, attribs) {
		for (var x in attribs)
		el[x] = attribs[x];
		return el;
	}
	
	HashTagEditor.prototype.f_enter = function(currentLine,e){		
		if (getBrowserType() == "firefox") { //파이어폭스를 제외한 다른 브라우저는 처음 셋팅된 태그를 적용해주지만 파이어폭스는 br로 div 안에서 개항 하기 때문에 양식에 맞게 수정
			var html = "";
			for(var i = 0;i<currentLine.childNodes.length;i++){
				html += currentLine.childNodes[i].innerHTML;
			}
			var strList = html.split("<br>");
			var nextLine = currentLine.nextSibling;
			currentLine.innerHTML = "<span class='" + this.classNames.spanClassName + "'>" + (strList[0] ? strList[0] : "<br>") + "</span>";
			this.f_editorChange({
				type : "enter", 
				currentLine : currentLine
			});
			for (var i = 1; i < strList.length; i++) {
				if (strList[i] == "" && i == strList.length - 1)
					break;
				if (nextLine) {
					nextLine.parentNode.insertBefore(this.getRowNode("node", strList[i]), nextLine);
					setCaretPosition(getCursorTarget(nextLine.previousSibling), 0);
					this.f_editorChange({
						type : "enter", 
						currentLine : nextLine.previousSibling
					});
				} else {
					currentLine.parentNode.appendChild(this.getRowNode("node", strList[i]));
					nextLine = currentLine.parentNode.childNodes[currentLine.parentNode.childNodes.length-1];
					setCaretPosition(getCursorTarget(nextLine), 0);
					this.f_editorChange({
						type : "enter", 
						currentLine : nextLine
					});
				}
			}
		}else{
			//enter로 생긴 라인과 enter 전 라인 텍스트 랩핑 실행
			this.f_editorChange({
				type : "enter", 
				currentLine : currentLine.previousSibling,
				notMove : true
			});
			this.f_editorChange({
				type : "enter", 
				currentLine : currentLine
			});
		}
	};
	
	HashTagEditor.prototype.f_backspace = function(currentLine,e){
		if (!currentLine) { //최상단에서 백스페이스 할경우 기본 폼이 날라가 버림 그래서 새로 만들어줌
			var node = this.getRowNode("node");
			this.editor.appendChild(node)
			setCaretPosition(getCursorTarget(node), 0);
		}else{ //백스페이스 중에 span 태그가 없어질 경우 새로 만들어줌
			var hasSpan = false;
			if (currentLine.childNodes[0].nodeName.toUpperCase() == "SPAN") {
				hasSpan = true;
			}
			if (!hasSpan) {
				currentLine.innerHTML = "<span class='" + this.classNames.spanClassName + "'><br></span>";
				setCaretPosition(getCursorTarget(currentLine), 0);
			}else{
				this.f_editorChange({
					type : "backspace",
					currentLine : currentLine
				});
			}
		}
	};
	
	//에디터가 처음 사용될 경우에 실행
	HashTagEditor.prototype.f_init = function(){
		var initSpan = this.editor.getElementsByClassName(this.classNames.placeholderClassName);
		if(initSpan[0].childNodes.length){
			initSpan[0].removeChild(initSpan[0].childNodes[0]);	
		}
		initSpan[0].innerHTML = blankHTML;
		initSpan[0].className = this.classNames.spanClassName;
		this.init = false;
	}
	
	//붙여넣기, 백스페이스, 엔터, 그리고 1byte charater가 입력될경우에는 텍스트 랩핑 실행
	HashTagEditor.prototype.f_editorChange = function(args){
		if(args.type == "init" || args.type == "paste" || args.type == "backspace" || args.type == "enter" || args.type == "1ch"){
			this.makeHashTag(args.currentLine,args.notMove); 
		}	

	}
	
	//firefox일 경우에만 공백입력이 " "로 계속 만들어져 브라우저상에서 표시가 안됨 
	//그래서 &nbsp;로 바꿔줌
	HashTagEditor.prototype.f_space = function(currentLine,e){
		var span = this.getSpanWrapper(windowSelection.focusNode);
		var offset = getCaretCharacterOffsetWithin(span);
		var html = span.innerHTML;
		html = html.replace(/&nbsp;/ig," ");
		html = html.substring(0,offset) + "&nbsp;" + html.substring(offset);
		html = html.replace(/ /ig,"&nbsp;");
		span.innerHTML = html;
		setCaretPosition(getCursorTarget(span),offset+1);
		this.f_editorChange({
			type : "space", 
			currentLine : currentLine,
		});
	}
	
	//텍스트 랩핑 함수
	//해쉬태그와 일반 텍스트를 구분하여 따로 랩핑해준다.
	HashTagEditor.prototype.makeHashTag = function(currentLine,notMove){
		var caretPos = getCaretCharacterOffsetWithin(currentLine);
		var res = "";
		
		var html = currentLine.innerHTML;
		
		var text = removeTag(html);
		
		if(text != ""){
			if (getBrowserType() == "firefox") {
				text = text.replace(/ /ig,"&nbsp;"); //firefox의 공백이 재대로 입력됬는지 한번더 체크
			}

			text = text.replace(/(&nbsp;| ){1}#/ig,"$1^?hashtagDivisonSection?^#"); //해쉬 태그별로 split 하기 위한 임의의 텍스트 - #으로 할경우 ##붙어있으면 안됨
			
			var arr = text.split("^?hashtagDivisonSection?^");
			
			for(var i=0;i<arr.length;i++){
				if(/(^#[^\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\" ]+)/.test(arr[i])){
					var exec = /\B(#[^\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\" ]+)(.*)/ig.exec(arr[i]);
					arr[i] = "<span class='"+this.classNames.hashtagClassName+"'>"+exec[1]+"</span>";
					if(exec[2]){
						arr[i] +="<span class='"+this.classNames.spanClassName+"'>"+exec[2]+"</span>";
					}
				}else{
					arr[i] = "<span class='"+this.classNames.spanClassName+"'>"+arr[i]+"</span>";
				}
			}	
			
			res = arr.join("");
			
			currentLine.innerHTML = res;
		}else if(currentLine.childNodes[0].className == "hashtag-em"){ //해쉬 태그 에서 엔터 쳐서 다음줄 span 클래스가 해쉬 태그로 되어있을 경우
			currentLine.childNodes[0].className = "hashtag-span";
		}
		
		if(!notMove){
			//커서를 이동
			setCaretPositionForChildrens(currentLine,caretPos);	
		}
	}
	HashTagEditor.prototype.getTargetLine = function(node) { //현재 커서가 있는 라인 검색
		var line = null;
		while (node) {
			if (node.className == this.classNames.lineClassName) {
				line = node;
				break;
			}
			node = node.parentNode;
		}
		return line;
	}
	HashTagEditor.prototype.getSpanWrapper = function(node) { //현재 커서가 잇는 span 검색
		var span = null;
		while (node) {
			if (node.className == this.classNames.spanClassName || node.className == this.classNames.hashtagClassName) {
				span = node;
				break;
			}
			node = node.parentNode;
		}
		return span;
	}
	HashTagEditor.prototype.getRowNode = function(type, val, init) { //라인 생성
		var spanClassName = init?this.classNames.placeholderClassName : this.classNames.spanClassName;
		
		if (type == "text") {
			return "<div class='" + this.classNames.lineClassName + "'><span class='" + spanClassName + "'>" + (val ? val : blankHTML) + "</span></div>";
		} else {
			var div = document.createElement("div");
			var span = document.createElement("span");
			span.innerHTML = val ? val : blankHTML;
			span.className = spanClassName;
			div.appendChild(span);
			div.className = this.classNames.lineClassName;
			return div;
		}
	}
	
	function getCursorTarget(node){ //커서를 셋팅 노드 검색
		var res;
		if(node.childNodes.length && node.childNodes[0].nodeName.toUpperCase() == "#TEXT" && node.childNodes[0] != ""){
			res = node.childNodes[0];
		}else{
			res = node;
		}
		return res;
	}
	
	function removeTag(html){ //text에서 태그 삭제
		return html.replace(/(<([^>]+)>)/ig, "");
	}
	function getBrowserType() {  //브라우저 타입
		// Opera 8.0+
		var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		// Firefox 1.0+
		var isFirefox = typeof InstallTrigger !== 'undefined';
		// At least Safari 3+: "[object HTMLElementConstructor]"
		var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		// Internet Explorer 6-11
		var isIE = /*@cc_on!@*/false || !!document.documentMode;
		// Edge 20+
		var isEdge = !isIE && !!window.StyleMedia;
		// Chrome 1+
		var isChrome = !!window.chrome && !!window.chrome.webstore;
		// Blink engine detection
		var isBlink = (isChrome || isOpera) && !!window.CSS;

		if (isOpera == true) {
			return "opera";
		} else if (isFirefox) {
			return "firefox";
		} else if (isSafari) {
			return "safari";
		} else if (isIE) {
			return "explore";
		} else if (isEdge) {
			return "edge";
		} else if (isChrome) {
			return "chrome"
		}

		return "";
	}
	//현재 커서 위치 
	function getCaretCharacterOffsetWithin(element) {
		var caretOffset;
		sel = window.getSelection();
		if (sel.rangeCount > 0) {
			var range = sel.getRangeAt(0);
			var preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = preCaretRange.toString().length;
		}
		return caretOffset;
	}
	function ieVersionCheck() { //ie브라우저 버전 체크
		var rv = -1; // Return value assumes failure.

	    if (navigator.appName == 'Microsoft Internet Explorer'){
	
	       var ua = navigator.userAgent,
	           re  = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
	
	       if (re.exec(ua) !== null){
	         rv = parseFloat( RegExp.$1 );
	       }
	    }
	    else if(navigator.appName == "Netscape"){                       
	       /// in IE 11 the navigator.appVersion says 'trident'
	       /// in Edge the navigator.appVersion does not say trident
	       if(navigator.appVersion.indexOf('Trident') === -1) rv = 12;
	       else rv = 11;
	    }       
	
	    return rv;      
	}
	//커서 위치 세팅
	function setCaretPosition(element, offset) { 
		try{
			var range = document.createRange();
			var sel = window.getSelection();
			range.setStart(element, offset);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);	
		}catch(e){
			//익스플로어 붙여넣기 할때 텍스트 노드 값을 재대로 못가져와서 offset 콘솔 에러 노출 (기능은 잘 동작)
		}
	}
	//자식노드가 있을경우 커서 셋팅
	function setCaretPositionForChildrens(element,offset){
		var target;
		for(var i=0;i<element.childNodes.length;i++){
			var el = element.childNodes[i];
			if(!el.childNodes[0]){
				target = null;
				break;
			}
			if(el.childNodes[0].length < offset){
				offset -= el.childNodes[0].length;
			}else{
				target = el;
				break;
			}
		}
		
		if(target){
			setCaretPosition(getCursorTarget(target),offset);	
		}
	}
	function getByteLength(s,b,i,c){
	    for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?3:c>>7?2:1);
	    return b;
	}
	function fireEvent(element,eventName){ //event trigger
		var event;
		if (document.createEvent) {
		    event = document.createEvent("HTMLEvents");
		    event.initEvent(eventName, true, true);
		  } else {
		    event = document.createEventObject();
		    event.eventType = eventName;
		  }
		  event.eventName = eventName;
		  if (document.createEvent) {
		    element.dispatchEvent(event);
		  } else {
		    element.fireEvent("on" + event.eventType, event);
		  }
	}
	var copyComputedStyle = function(from,to){
		var computed_style_object = false;

		computed_style_object = from.currentStyle || document.defaultView.getComputedStyle(from,null);

		if(!computed_style_object) return null;

		var stylePropertyValid = function(name,value){
			return typeof value !== 'undefined' &&
				typeof value !== 'object' &&
				typeof value !== 'function' &&
				value.length > 0 &&
				value != parseInt(value) &&
				property.indexOf("webkit") < 0 &&
					name != "cssText"


		};
		var i=0;
		for(property in computed_style_object)
		{

			//console.log(property)
			if(stylePropertyValid(property,computed_style_object[property]))
			{
				if(i>480 && i <500){
					console.log(property)
				}

				i++;


					to.style[property] = computed_style_object[property];

			}
		}

	};

	$.fn.bindHashtagEditor = function(options){
		bindHashtagEditor($(this), options);
	}
})(window,jQuery);