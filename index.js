(function(){
  var output = document.getElementById("output");
  var oldhash = null;
  // render a state
  function RenderDocument(data){
    if(!data){
      return;
    }
    output.innerHTML = marked(data.html);
    document.title = data.title;
    var code = Array.from(output.querySelectorAll("pre code"));
    for(var i in code){
      hljs.highlightBlock(code[i]);
    }
    var repl = Array.from(document.querySelectorAll(".nav,.nam"));
    for(var i in repl){
      repl[i].href = location.hash.split("?")[0] + repl[i].getAttribute("link");
    }
    var repl2 = Array.from(document.getElementsByClassName("nam"));
    for(var i in repl2){
      repl2[i].name = location.hash.split("?")[0] + repl2[i].getAttribute("link");
    }
    if(location.hash.search(/\?/gm) !== -1){
      try{
        document.querySelector('[name="' + location.hash + '"]').scrollIntoView();
      }catch(e){}
    }
  }
  function FetchData(first){
    if(!first && location.hash.search(/\?/gm) !== -1){
      try{
        document.querySelector('[name="' + location.hash + '"]').scrollIntoView();
      }catch(e){}
      if(oldhash === location.hash.split("?")[0]){
        return;
      }
    }else if(location.hash.search(/\?/gm) === -1){
      scrollTo(0,0);
    }
    if(location.hash === "#/search"){
      if(first){
        location.hash = "#";
      }
      return;
    }
    oldhash = location.hash.split("?")[0];
    var path = location.hash.split("#")[1];
    if(path === "/" || !path){
      location.hash = "#/welcome";
      return;
    }
    var link = document.querySelector('[href="' + location.hash.split("?")[0] + '"]');
    try{document.title = link.textContent + " | Kahoot API Documentation V2";}catch(e){}
    try{
      document.querySelector(".selected").className = "";
    }catch(e){}
    try{link.className = "selected";}catch(e){}
    var x = new XMLHttpRequest();
    x.open("GET","docs" + path.split("?")[0] + ".md");
    x.send();
    x.onload = function(){
      RenderDocument({
        title: document.title,
        html: x.response
      });
    }
  }
  window.addEventListener("hashchange",function(event){
    event.preventDefault();
    FetchData();
  });
  FetchData(true);
  var mobiToggle = document.getElementById("mobi-menu-toggle");
  var mobiToggleIn = document.getElementById("mobile-menu");
  mobiToggle.addEventListener("click",function(){
    if(!mobiToggleIn.checked){
      mobiToggle.className = "mobileonly close";
    }else{
      mobiToggle.className = "mobile-dark mobileonly";
    }
  });
  if(localStorage.EnableLightMode){
    document.documentElement.className = "light";
  }
  var darkSwitch = document.getElementById("dark-mode-switch");
  darkSwitch.addEventListener("click",function(){
    if(localStorage.EnableLightMode){
      delete localStorage.EnableLightMode;
      document.documentElement.className = "";
    }else{
      localStorage.EnableLightMode = true;
      document.documentElement.className = "light";
    }
  });
  var search = document.getElementById("search");
  var cancelSearch = false;
  search.addEventListener("keydown",function(e){
    if((e.code && e.code === "Enter") || (e.keyCode === 13)){
      location.hash = "#/search";
      output.innerHTML = '<div id="prep">\
        <div style="flex: 1;">\
          <img src="loading.svg" alt="Loading... Please wait">\
        </div>\
      </div>';
      // begin searching
      var files = Array.from(document.getElementById("selection").querySelectorAll("a"));
      cancelSearch = false;
      Search(files,search.value);
    }
  });
  function AddSearch(file){
    if(document.getElementById("output").querySelector("#prep")){
      output.innerHTML = "";
    }
    console.log(file)
    var link = document.createElement("div");
    link.innerHTML = '<a class="search" href="'+ file.href +'">'+ file.textContent +'</a>';
    output.appendChild(link);
  }
  function Search(files,term){
    var file = files[0];
    var x = new XMLHttpRequest;
    x.open("GET","/docs/" + file.href.split("#/")[1] + ".md");
    x.send();
    x.onerror = function(){
      if(cancelSearch || files.length === 1){
        return cancelSearch = false;
      }
      Search(files.slice(1),term);
    }
    x.onload = function(){
      if(file.textContent.search(term.search(term)) !== -1){
        AddSearch(file);
      }else{
        var rchunk = x.response.split(" ");
        var tchunk = term.split(" ");
        var done = false;
        for(var i = 0;(i<tchunk.length && !done);i++){
          for(var j = 0;j<rchunk.length;j++){
            if(tchunk.length === 1 ? rchunk[j].toLowerCase().search(tchunk[i].toLowerCase()) !== -1 : rchunk[j] === tchunk[i]){
              AddSearch(file);
              done = true;
              break;
            }
          }
        }
      }
      if(cancelSearch || files.length === 1){
        if(document.getElementById("output").querySelector("#prep")){
          output.innerHTML = "No results found.";
        }
        return cancelSearch = false;
      }
      Search(files.slice(1),term);
    };
  }
})();
