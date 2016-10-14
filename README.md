# hashtageditor

hashtag editor using contenteditable div

If you want demo and document. Click below link.

<a target="blanK" href="http://hashtageditor.onekwan.com/">go to demo site</a>


<div class="article">
    <div class="section">
        <h1 id="top">
            Hashtag Editor
        </h1>
        <p>
            this editor is maked contenteditable div and javascript.<br/> it activate like facebook, twitter.
        </p>
        <div>
            <a class="github-button" href="https://github.com/ilgwonson/hashtageditor.git" data-style="mega" data-count-href="/ilgwonson/hashtageditor/stargazers" data-count-api="/repos//ilgwonson/hashtageditor#stargazers_count" data-count-aria-label="# stargazers on GitHub" aria-label="Star ilgwonson/hashtageditor on GitHub">
                Go git hub
            </a>
        </div>
    </div>
    <div class="section">
        <h2 id="demo">
            Demo
        </h2>
        <textarea id="hashtag_editor" class="editor" data-edittype="1" contenteditable="true">hi #hashtagEditor</textarea>
        <script>
            var obj = document.getElementById("hashtag_editor");
             var options={placeHolder : "enter text"};
             var editors = bindHashtagEditor(obj, options);
             editors[0].focus();
        </script>
    </div>
    <div class="section">
        <h2 id="getstarted">
            Get started
        </h2>
        <div class="coding">
            <script async src="//jsfiddle.net/Sonilgwon/mka24c21/7/embed/html/"></script>
        </div>
        <p class="mt20">
            you can use div and textarea.<br/>
            obj argument is possible to object or array make by getElementsClassName, TagName<br/>
            bindHashtagEditor function return array having hashtagEditor.
            <br/><br/>
            * If you use textarea,<br/>
            plugin script make div(contenteditable). and copy style.
        </p>
    </div>
    <div class="section">
        <h2 id="setcss">
            Set CSS
        </h2>
        <div class="coding">
            <script async src="//jsfiddle.net/Sonilgwon/sre74evx/3/embed/css/"></script>
        </div>
    </div>
    <div class="section">
        <h2 id="options">
            Options
        </h2>
        <div class="coding">
            <script async src="//jsfiddle.net/Sonilgwon/k8ys5eqs/1/embed/js/"></script>
        </div>
    </div>
    <div class="section">
        <h2 id="focus">
            Focus
        </h2>
        <div class="coding">
            <script async src="//jsfiddle.net/Sonilgwon/kmfnopz1/1/embed/js/"></script>
        </div>
        <p class="mt20">
            * not working in firefox.
        </p>
    </div>
    <div class="section">
        <h2 id="submit">
            Submit
        </h2>
        <div class="coding">
            <script async src="//jsfiddle.net/Sonilgwon/5L6s071x/2/embed/js/"></script>
        </div>
        <textarea id="hashtag_editor2" class="editor mt20" data-edittype="2" contenteditable="true">if you try <span class='hashtag-em'>#submit</span>,<br>You choose <span class='hashtag-em'>#data</span> Type</textarea>
        <div class="mt10">
            <button id="btn_submit" class="btn btn-default">submit1</button>
            <button id="btn_submit2" class="btn btn-default">submit2</button>
            <button id="btn_submit3" class="btn btn-default">submit3</button>
        </div>
        <script>
            var obj = document.getElementById("hashtag_editor2");
            var editors2 = bindHashtagEditor(obj);
            document.getElementById("btn_submit").addEventListener("click",function(){
                var text = editors2[0].setTextValue(1);
                alert(text);
            });
            document.getElementById("btn_submit2").addEventListener("click",function(){
                var text = editors2[0].setTextValue(2);
                alert(text);
            });
            document.getElementById("btn_submit3").addEventListener("click",function(){
                var text = editors2[0].setTextValue(3);
                alert(text);
            });
        </script>
    </div>
    <div class="section">
        <h2 id="editmode">
            Edit mode
        </h2>
        <div class="coding">
            <script async src="//jsfiddle.net/Sonilgwon/vk43n1u2/3/embed/html/"></script>
        </div>
        <p class="mt20">
            You setting value in DIV and textarea.<br/>
            I am support 3type value. like submit mode.<br/>
        </p>
    </div>
    <div class="section">
        <h2 id="usejquery">
            Use jQuey
        </h2>
        <div class="coding">
            <script async src="//jsfiddle.net/Sonilgwon/ngp41whc/embed/js/"></script>
        </div>
    </div>
    <div class="section">
        <h2 id="structure">
            structure
        </h2>
        <img src="/images/hashtag_structure.png" />
    </div>
    <div class="section">
        <h2 id="supportbrowser">
            Support Browser
        </h2>
        <p class="mt20">
            ie >= 9, chrome, firefox, opera, safari
        </p>
    </div>
    <div class="section">
        <h2 id="license">
            License
        </h2>
        <p class="mt20">
            MIT License
        </p>
    </div>
    <div class="section">
        <h2 id="contact">
            Contact
        </h2>
        <p class="mt20">
            If you have quetion, Please send mail to <a href="mailto:onekwanson@gmail.com">onekwanson@gmail.com</a>
        </p>
    </div>
</div>